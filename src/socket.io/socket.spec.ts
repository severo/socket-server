import ioClient from 'socket.io-client'
import io from 'socket.io'
import Automerge from 'automerge'
import { default as chai, expect } from 'chai'
import chaiThings from 'chai-things'
chai.should()
chai.use(chaiThings)

import { MockLogger } from '../shared/index'
import { Socket } from './socket'
import {
  UpdateStateEvent,
  UpdateUserNameEvent,
  UpdateUserColorEvent,
} from '../domain/events/toserver'
import {
  ResetStateEvent,
  SendStateEvent,
  UsersListEvent,
} from '../domain/events/toclient'
import { ExportedUser } from '../domain'

const PORT: number = 5000
const socketUrl: string = `http://localhost:${PORT}`
const options: SocketIOClient.ConnectOpts = {
  transports: ['websocket'],
  forceNew: true,
  autoConnect: false,
}

const isConnected = (client: SocketIOClient.Socket) =>
  new Promise(resolve => client.on('connect', resolve))

const getResetStateEvent = (client: SocketIOClient.Socket): Promise<string> =>
  new Promise(resolve => client.on(ResetStateEvent.eventName, resolve))

const getUpdateStateEvent = (
  client: SocketIOClient.Socket
): Promise<UpdateStateEventArgs> =>
  new Promise(resolve => client.on(UpdateStateEvent.eventName, resolve))

const getUsersList = (client: SocketIOClient.Socket): Promise<ExportedUser[]> =>
  new Promise(resolve => client.on(UsersListEvent.eventName, resolve))

const ackToUpdateState = (
  client: SocketIOClient.Socket,
  args: any
): Promise<UpdateStateAckArgs> =>
  new Promise(resolve =>
    client.emit(
      UpdateStateEvent.eventName,
      new UpdateStateEvent(args).data,
      resolve
    )
  )

const ackToUpdateUserName = (
  client: SocketIOClient.Socket,
  args: any
): Promise<UpdateUserNameAckArgs> =>
  new Promise(resolve =>
    client.emit(
      UpdateUserNameEvent.eventName,
      new UpdateUserNameEvent(args).data,
      resolve
    )
  )

const ackToUpdateUserColor = (
  client: SocketIOClient.Socket,
  args: any
): Promise<UpdateUserColorAckArgs> =>
  new Promise(resolve =>
    client.emit(
      UpdateUserColorEvent.eventName,
      new UpdateUserColorEvent(args).data,
      resolve
    )
  )

const waitTms = (t: number) =>
  new Promise(resolve => setTimeout(() => resolve('Timeout'), t))

describe('Server', () => {
  describe('Socket', () => {
    describe('/occupapp-beta namespace', () => {
      let server: SocketIO.Server
      let socket: Socket
      let client1: SocketIOClient.Socket
      let client2: SocketIOClient.Socket
      let client3: SocketIOClient.Socket
      let mockLogger: MockLogger

      beforeEach(() => {
        server = io()
        mockLogger = new MockLogger()
        socket = new Socket(server, mockLogger)
        socket.connect()
        server.listen(PORT)

        client1 = ioClient(socketUrl + '/occupapp-beta', options)
        client2 = ioClient(socketUrl + '/occupapp-beta', options)
        client3 = ioClient(socketUrl + '/occupapp-beta', options)
      })

      afterEach(() => {
        client3.close()
        client2.close()
        client1.close()
        server.close()
      })

      describe('connect', () => {
        it('should connect socket', async () => {
          client1.connect()
          await isConnected(client1)
          expect(client1.connected).to.be.true
        })
        it('should create a new user', async () => {
          client1.connect()
          await isConnected(client1)
          mockLogger
            .getInfoLogs()
            .should.include.something.that.equals(
              `Connection from socket ${client1.id}`
            )
          mockLogger
            .getInfoLogs()
            .should.include.something.that.equals(
              `createUser - New user created (client socket ${client1.id})`
            )
        })
        it('should send the ordered list of users to the first user when the second one connects, and the ids should correspond to client sockets ids', async () => {
          // arrange
          client1.connect()
          await isConnected(client1)

          // act
          const [list] = await Promise.all([
            getUsersList(client1),
            client2.connect(),
          ])

          // assert
          expect(list).to.have.length(2)
          list.should.all.have.property('name')
          list.should.all.have.property('color')
          expect(list[0]).to.have.property('id', client1.id)
          expect(list[1]).to.have.property('id', client2.id)
        })

        it('should send the send-state event to the first user, and update the state with the ack', async () => {
          // arrange
          const clientState: any = {
            p1: 'first property',
            p2: 2,
          }
          const clientAckArgs: SendStateAckArgs = {
            sent: true,
            state: Automerge.save(Automerge.from(clientState)),
          }
          client1.on(SendStateEvent.eventName, (ack: SendStateAck) => {
            ack(clientAckArgs)
          })
          client1.connect()
          await isConnected(client1)

          // act
          await waitTms(50)

          // assert
          mockLogger
            .getInfoLogs()
            .should.include.something.that.equals(`State reset from client`)
        })

        it('should send the current Automerge state to the second user', async () => {
          // arrange
          client1.connect()
          client2.connect()
          await isConnected(client1)

          // act
          const result = await Promise.all([
            getResetStateEvent(client2),
            isConnected(client2),
          ])
          const value = result[0].toString()

          // assert
          expect(Automerge.load(value)).to.deep.equal({})
        })
      })

      describe('disconnect', () => {
        // TODO: test that the user is removed if connection is lost, or comes
        // from the server side?
        // For example, that the "ghosts" users are removed correctly
        // See https://socket.io/docs/client-api/#new-Manager-url-options
        // > timeout | 20000 | connection timeout before a connect_error and
        // >         |       | connect_timeout events are emitted
        //
        // The client should be disconnected after the timeout, and the user
        // should be removed from the list
        // Is it possible to simulate this in test? See socket.io integration
        // tests for reference
        it('should disconnect socket', async () => {
          // arrange
          client1.connect()
          await isConnected(client1)

          // act
          client1.disconnect()

          //assert
          expect(client1.connected).to.be.false
        })
        it('should send the ordered list of users', async () => {
          // arrange
          client1.connect()
          client2.connect()
          await isConnected(client1)
          await isConnected(client2)

          // act
          client2.disconnect()
          const list = await getUsersList(client1)

          // assert
          expect(list).to.exist
          list.should.all.have.property('name')
          list.should.all.have.property('color')
        })
        it('should not include the disconnected socket id in the list of users', async () => {
          // arrange
          client1.connect()
          client2.connect()
          await isConnected(client1)
          await isConnected(client2)
          const client2Id = client2.id

          // act
          client2.disconnect()
          const list = await getUsersList(client1)

          // assert
          list.should.not.include.something.that.has.property('id', client2Id)
        })
        it('should include the other connected users', async () => {
          // arrange
          client1.connect()
          client2.connect()
          client3.connect()
          await isConnected(client1)
          await isConnected(client2)
          await isConnected(client3)

          // act
          client3.disconnect()
          const list = await getUsersList(client1)

          // assert
          expect(list).to.have.length(2)
          expect(list[0]).to.have.property('id', client1.id)
          expect(list[1]).to.have.property('id', client2.id)
        })
        it('should log that the socket has been disconnected and the user has been removed', async () => {
          // arrange
          client1.connect()
          client2.connect()
          await isConnected(client1)
          await isConnected(client2)
          const client2Id = client2.id

          // act
          client2.disconnect()
          await getUsersList(client1)

          // assert
          mockLogger
            .getInfoLogs()
            .should.include.something.that.equals(
              `Disconnection from socket ${client2Id} - reason: client namespace disconnect`
            )
          mockLogger
            .getInfoLogs()
            .should.include.something.that.equals(
              `removeUser - User removed (client socket ${client2Id})`
            )
        })
      })

      describe('update-state', () => {
        it('should log info message for empty data, and updated should be false', async () => {
          // arrange
          const args: undefined = undefined
          client1.connect()
          await isConnected(client1)

          // act
          const value = await ackToUpdateState(client1, args)

          // assert
          expect(value).to.not.be.undefined
          expect(value).to.have.property('updated', false)
          expect(value).to.have.property('error')
          expect(value.error).to.have.property('name', 'TypeError')
          expect(value.error).to.have.property(
            'message',
            'object null is not iterable (cannot read property Symbol(Symbol.iterator))'
          )
          mockLogger
            .getInfoLogs()
            .should.include.an.item.that.equals(
              `State could not be updated - object null is not iterable (cannot read property Symbol(Symbol.iterator))`
            )
        })

        it('should log success info message for empty changes array, and updated should be true, and error should not exist', async () => {
          // arrange
          const args: UpdateStateEventArgs = []
          client1.connect()
          await isConnected(client1)

          // act
          const value = await ackToUpdateState(client1, args)

          // assert
          expect(value).to.not.be.undefined
          expect(value).to.have.property('updated', true)
          expect(value).to.not.have.property('error')
          mockLogger
            .getInfoLogs()
            .should.include.something.that.equals(`State updated`)
        })

        // arrange
        const newState = {
          points: [{ x: 1, y: 2 }],
          imageSrc: 'lake.png',
        }
        const changes: UpdateStateEventArgs = [
          {
            ops: [
              {
                action: 'makeList',
                obj: 'be89e397-324c-4bec-932a-ae087a3177de',
              },
              {
                action: 'ins',
                obj: 'be89e397-324c-4bec-932a-ae087a3177de',
                key: '_head',
                elem: 1,
              },
              {
                action: 'makeMap',
                obj: '8b94a2c5-98c3-4ed9-8a18-ccae369cf168',
              },
              {
                action: 'set',
                obj: '8b94a2c5-98c3-4ed9-8a18-ccae369cf168',
                key: 'x',
                value: 1,
              },
              {
                action: 'set',
                obj: '8b94a2c5-98c3-4ed9-8a18-ccae369cf168',
                key: 'y',
                value: 2,
              },
              {
                action: 'link',
                obj: 'be89e397-324c-4bec-932a-ae087a3177de',
                key: 'b6336846-12b7-4d8c-a4ab-949a3afd1903:1',
                value: '8b94a2c5-98c3-4ed9-8a18-ccae369cf168',
              },
              {
                action: 'link',
                obj: '00000000-0000-0000-0000-000000000000',
                key: 'points',
                value: 'be89e397-324c-4bec-932a-ae087a3177de',
              },
              {
                action: 'set',
                obj: '00000000-0000-0000-0000-000000000000',
                key: 'imageSrc',
                value: 'lake.png',
              },
            ],
            actor: 'b6336846-12b7-4d8c-a4ab-949a3afd1903',
            seq: 1,
            deps: {},
          },
        ]

        it('should log info message for non-empty valid changes array, updated should be true, and error should not exist', async () => {
          // arrange
          client1.connect()
          await isConnected(client1)

          // act
          const value = await ackToUpdateState(client1, changes)

          // assert
          expect(value).to.not.be.undefined
          expect(value).to.have.property('updated', true)
          expect(value).to.not.have.property('error')
          mockLogger
            .getInfoLogs()
            .should.include.something.that.equals(`State updated`)
        })

        it('should send the same event to the other clients', async () => {
          // arrange
          client1.connect()
          client2.connect()
          await isConnected(client1)
          await isConnected(client2)

          // act
          const [receivedChanges] = await Promise.all([
            getUpdateStateEvent(client2),
            ackToUpdateState(client1, changes),
          ])

          // assert
          expect(receivedChanges).to.not.be.undefined
          expect(receivedChanges).to.deep.equal(changes)
        })

        it('should not send the same event to the sender', async () => {
          // arrange
          client1.connect()
          await isConnected(client1)

          // act
          const [receivedChanges] = await Promise.all([
            Promise.race([getUpdateStateEvent(client1), waitTms(50)]),
            ackToUpdateState(client1, changes),
          ])

          // assert
          expect(receivedChanges).to.equal('Timeout')
        })

        it('should send the persisted state to a new client, after the state had been updated', async () => {
          // arrange
          // arrange
          client1.connect()
          await isConnected(client1)
          await ackToUpdateState(client1, changes)

          // act
          client2.connect()
          const state = await getResetStateEvent(client2)

          // assert
          expect(Automerge.load(state)).to.deep.equal(newState)
        })
      })

      describe('update-user-name', () => {
        it('should log info message for empty data, and updated should be false', async () => {
          // arrange
          client1.connect()
          await isConnected(client1)
          const args: undefined = undefined

          // act
          const value = await ackToUpdateUserName(client1, args)

          // assert
          expect(value).to.not.be.undefined
          expect(value).to.have.property('updated', false)
          expect(value).to.have.property('error')
          expect(value.error).to.have.property('name', 'Error')
          expect(value.error).to.have.property(
            'message',
            `Parameter data is required`
          )
          mockLogger
            .getInfoLogs()
            .should.include.something.that.equals(
              `User name could not be updated - Parameter data is required`
            )
        })

        it('should log info message for empty name and updated should be false', async () => {
          // arrange
          client1.connect()
          await isConnected(client1)
          const args = { name: '' }

          // act
          const value = await ackToUpdateUserName(client1, args)

          // assert
          expect(value).to.not.be.undefined
          expect(value).to.have.property('updated', false)
          expect(value).to.have.property('error')
          expect(value.error).to.have.property('name', 'Error')
          expect(value.error).to.have.property(
            'message',
            `Parameter <Object>.name is required`
          )
          mockLogger
            .getInfoLogs()
            .should.include.something.that.equals(
              `User name could not be updated - Parameter <Object>.name is required`
            )
        })

        it('should log info message for valid name, updated should be true, error should not exist, and a users-list event should be sent', async () => {
          // arrange
          client1.connect()
          client2.connect()
          await isConnected(client1)
          await isConnected(client2)
          const args = { name: 'George' }

          // act
          const [value, list] = await Promise.all([
            await ackToUpdateUserName(client1, args),
            getUsersList(client2),
          ])

          // assert
          expect(value).to.not.be.undefined
          expect(value).to.have.property('updated', true)
          expect(value).to.not.have.property('error')
          mockLogger
            .getInfoLogs()
            .should.include.something.that.equals(`User name updated`)
          expect(list).to.have.length(2)
          const clientUser = list.find(user => user.id === client1.id)
          expect(clientUser).to.have.property('name', 'George')
        })
      })

      describe('update-user-color', () => {
        it('should log info message for empty data and updated should be false', async () => {
          // arrange
          client1.connect()
          await isConnected(client1)
          const args: undefined = undefined

          // act
          const value = await ackToUpdateUserColor(client1, args)

          // assert
          expect(value).to.not.be.undefined
          expect(value).to.have.property('updated', false)
          expect(value).to.have.property('error')
          expect(value.error).to.have.property('name', 'Error')
          expect(value.error).to.have.property(
            'message',
            `Parameter data is required`
          )
          mockLogger
            .getInfoLogs()
            .should.include.something.that.equals(
              `User color could not be updated - Parameter data is required`
            )
        })

        it('should log info message for empty color and updated should be false', async () => {
          // arrange
          client1.connect()
          await isConnected(client1)
          const args = { color: '' }

          // act
          const value = await ackToUpdateUserColor(client1, args)

          // assert
          expect(value).to.not.be.undefined
          expect(value).to.have.property('updated', false)
          expect(value).to.have.property('error')
          expect(value.error).to.have.property('name', 'Error')
          expect(value.error).to.have.property(
            'message',
            `Parameter <Object>.color is required`
          )
          mockLogger
            .getInfoLogs()
            .should.include.something.that.equals(
              `User color could not be updated - Parameter <Object>.color is required`
            )
        })

        it('should log info message for invalid color and updated should be false', async () => {
          // arrange
          client1.connect()
          await isConnected(client1)
          const args = { color: '1235g' }

          // act
          const value = await ackToUpdateUserColor(client1, args)

          // assert
          expect(value).to.not.be.undefined
          expect(value).to.have.property('updated', false)
          expect(value).to.have.property('error')
          expect(value.error).to.have.property('name', 'Error')
          expect(value.error).to.have.property(
            'message',
            `Parameter <Object>.color has not an hexadecimal color format`
          )
          mockLogger
            .getInfoLogs()
            .should.include.something.that.equals(
              `User color could not be updated - Parameter <Object>.color has not an hexadecimal color format`
            )
        })

        it('should log info message for valid color, updated should be true, error should not exist, and a users-list event should be sent', async () => {
          // arrange
          client1.connect()
          client2.connect()
          await isConnected(client1)
          await isConnected(client2)
          const args = { color: '#123BCA' }

          // act
          const [value, list] = await Promise.all([
            await ackToUpdateUserColor(client1, args),
            getUsersList(client2),
          ])

          // assert
          expect(value).to.not.be.undefined
          expect(value).to.have.property('updated', true)
          expect(value).to.not.have.property('error')
          mockLogger
            .getInfoLogs()
            .should.include.something.that.equals(`User color updated`)
          expect(list).to.have.length(2)
          const clientUser = list.find(user => user.id === client1.id)
          expect(clientUser).to.have.property('color', '#123BCA')
        })
      })
    })
  })
})
