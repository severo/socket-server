import ioClient from 'socket.io-client'
import io from 'socket.io'
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
import { StateEvent, UsersListEvent } from '../domain/events/toclient'
import { ExportedUser } from '../domain'

const socketUrl: string = 'http://localhost:5000'
const options: SocketIOClient.ConnectOpts = {
  transports: ['websocket'],
  forceNew: true,
}

describe('Server', () => {
  describe('Socket', () => {
    describe('/occupapp-beta namespace', () => {
      let server: SocketIO.Server
      let socket: Socket
      let client: SocketIOClient.Socket
      let passiveClient: SocketIOClient.Socket
      let mockLogger: MockLogger

      // order of the clients in the Socket class' 'users' property
      // requires the clients to be connected in that order
      const ACTIVE_CLIENT_IDX = 0
      const PASSIVE_CLIENT_IDX = 1
      const NEW_CLIENT_IDX = 2

      beforeEach(() => {
        server = io().listen(5000)
        mockLogger = new MockLogger()
        socket = new Socket(server, mockLogger)
        socket.connect()
        client = ioClient.connect(socketUrl + '/occupapp-beta', options)
        passiveClient = ioClient.connect(socketUrl + '/occupapp-beta', options)
      })

      afterEach(() => {
        passiveClient.close()
        client.close()
        server.close()
      })

      describe('connect', () => {
        beforeEach(async () => {
          await new Promise(resolve => client.on('connect', resolve))
        })

        it('should connect socket', async () => {
          expect(client.connected).to.be.true
        })
        it('should create a new user', async () => {
          mockLogger
            .getInfoLogs()
            .should.include.something.that.have.string(
              'New user created for socket'
            )
        })
        it('should send the ordered list of users, and their id should correspond to client sockets ids', async () => {
          await new Promise(resolve => passiveClient.on('connect', resolve))
          const getUsersList = (): Promise<ExportedUser[]> =>
            new Promise(resolve =>
              passiveClient.on(UsersListEvent.eventName, resolve)
            )

          // act
          const [list, newClient] = await Promise.all([
            getUsersList(),
            ioClient.connect(socketUrl + '/occupapp-beta', options),
          ])

          // assert
          expect(list).to.have.length(3)
          list.should.all.have.property('name')
          list.should.all.have.property('color')
          expect(list[ACTIVE_CLIENT_IDX]).to.have.property('id', client.id)
          expect(list[PASSIVE_CLIENT_IDX]).to.have.property(
            'id',
            passiveClient.id
          )
          expect(list[NEW_CLIENT_IDX]).to.have.property('id', newClient.id)

          // after
          newClient.disconnect()
        })

        it('should send an empty state to a new user meanwhile the state has not been changed', async () => {
          // arrange
          const getStateEvent = (): Promise<object> =>
            new Promise(resolve =>
              passiveClient.on(StateEvent.eventName, resolve)
            )

          // act
          const state = await getStateEvent()

          // assert
          expect(state).to.deep.equal({})
        })
      })

      describe('update-state', () => {
        let updateState: (
          args: UpdateStateEventArgs
        ) => Promise<UpdateStateAckArgs>

        beforeEach(async () => {
          await new Promise(resolve => client.on('connect', resolve))
          updateState = args =>
            new Promise(resolve =>
              client.emit(
                UpdateStateEvent.eventName,
                new UpdateStateEvent(args).data,
                resolve
              )
            )
        })

        it('should log info message for empty data, and updated should be false', async () => {
          // arrange
          const args: undefined = undefined

          // act
          const value = await updateState(args)

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

          // act
          const value = await updateState(args)

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
          // act
          const value = await updateState(changes)

          // assert
          expect(value).to.not.be.undefined
          expect(value).to.have.property('updated', true)
          expect(value).to.not.have.property('error')
          mockLogger
            .getInfoLogs()
            .should.include.something.that.equals(`State updated`)
        })

        it('should send the current state to a new client, after the state had been updated', async () => {
          // arrange
          let newClient: SocketIOClient.Socket
          const getStateEvent = (): Promise<object> => {
            return new Promise(resolve => {
              newClient = ioClient.connect(
                socketUrl + '/occupapp-beta',
                options
              )
              newClient.on(StateEvent.eventName, resolve)
            })
          }

          // act
          await updateState(changes)
          const state = await getStateEvent()

          // assert
          expect(state).to.deep.equal(newState)

          // after
          newClient.disconnect()
        })
      })

      describe('update-user-name', () => {
        let updateNameUser: (
          args: UpdateUserNameEventArgs
        ) => Promise<UpdateUserNameAckArgs>

        beforeEach(async () => {
          await new Promise(resolve => client.on('connect', resolve))
          updateNameUser = args =>
            new Promise(resolve =>
              client.emit(
                UpdateUserNameEvent.eventName,
                new UpdateUserNameEvent(args).data,
                resolve
              )
            )
        })

        it('should log info message for empty data, and updated should be false', async () => {
          // arrange
          const args: undefined = undefined

          // act
          const value = await updateNameUser(args)

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
          const args = { name: '' }

          // act
          const value = await updateNameUser(args)

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
          await new Promise(resolve => passiveClient.on('connect', resolve))
          const getUsersList = (): Promise<ExportedUser[]> =>
            new Promise(resolve =>
              passiveClient.on(UsersListEvent.eventName, resolve)
            )

          const args = { name: 'George' }

          // act
          const [value, list]: [
            UpdateUserColorAckArgs,
            ExportedUser[]
          ] = await Promise.all([updateNameUser(args), getUsersList()])

          // assert
          expect(value).to.not.be.undefined
          expect(value).to.have.property('updated', true)
          expect(value).to.not.have.property('error')
          mockLogger
            .getInfoLogs()
            .should.include.something.that.equals(`User name updated`)
          expect(list).to.have.length(2)
          const clientUser = list.find(user => user.id === client.id)
          expect(clientUser).to.have.property('name', 'George')
        })
      })

      describe('update-user-color', () => {
        let updateColorUser: (
          args: UpdateUserColorEventArgs
        ) => Promise<UpdateUserColorAckArgs>

        beforeEach(async () => {
          await new Promise(resolve => client.on('connect', resolve))
          updateColorUser = args =>
            new Promise(resolve =>
              client.emit(
                UpdateUserColorEvent.eventName,
                new UpdateUserColorEvent(args).data,
                resolve
              )
            )
        })

        it('should log info message for empty data and updated should be false', async () => {
          // arrange
          const args: undefined = undefined

          // act
          const value = await updateColorUser(args)

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
          const args = { color: '' }

          // act
          const value = await updateColorUser(args)

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
          const args = { color: '1235g' }

          // act
          const value = await updateColorUser(args)

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
          await new Promise(resolve => passiveClient.on('connect', resolve))
          const getUsersList = (): Promise<ExportedUser[]> =>
            new Promise(resolve =>
              passiveClient.on(UsersListEvent.eventName, resolve)
            )

          const args = { color: '#123BCA' }

          // act
          const [value, list]: [
            UpdateUserColorAckArgs,
            ExportedUser[]
          ] = await Promise.all([updateColorUser(args), getUsersList()])

          // assert
          expect(value).to.not.be.undefined
          expect(value).to.have.property('updated', true)
          expect(value).to.not.have.property('error')
          mockLogger
            .getInfoLogs()
            .should.include.something.that.equals(`User color updated`)
          expect(list).to.have.length(2)
          const clientUser = list.find(user => user.id === client.id)
          expect(clientUser).to.have.property('color', '#123BCA')
        })
      })

      //
      //
      //     it("should emit 'internal-server-error' when name is not defined", (done: Function) => {
      //         client.on("connect", () => {
      //             // assert
      //             let rooms = server.sockets.adapter.rooms;
      //             let roomJoinEventArgs: { roomId: string, name: string };
      //             let roomJoinEvent: RoomJoinEvent;
      //             let roomCreateEventArgs: { name: string } = { name: "George" };
      //             let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);
      //
      //             client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
      //                 assert.isDefined(error.id);
      //                 assert.equal("Parameter <Object>.name is required", error.message);
      //                 assert.equal("Error", error.name);
      //                 done();
      //             });
      //
      //             // act
      //             client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($create: CreateRoomCallbackArgs) => {
      //                 roomJoinEventArgs = { roomId: $create.roomId, name: undefined };
      //                 roomJoinEvent = new RoomJoinEvent(roomJoinEventArgs);
      //
      //                 client.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($value: RoomJoinCallbackArgs) => {
      //                     assert.isFalse($value.access);
      //                 });
      //             });
      //         });
      //     });
      //
      //     it("should add user to valid room, allow access and emits 'users-all' event to update global list of users", (done: Function) => {
      //         client.on("connect", () => {
      //             // assert
      //             let rooms = server.sockets.adapter.rooms;
      //             let roomJoinEventArgs: { roomId: string, name: string };
      //             let roomJoinEvent: RoomJoinEvent;
      //             let john: string = "John";
      //             let george: string = "George";
      //             let roomCreateEventArgs: { name: string } = { name: george };
      //             let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);
      //             let status: "room-create" | "room-join";
      //
      //             // asserts room-show-all for moderator
      //             client.on(RoomShowAllEvent.eventName, (users: UserRole[]) => {
      //                 if (status === "room-create") {
      //                     // happens when current socket creates room
      //                     assert.equal(1, users.length);
      //                     assert.equal(users[0].name, george);
      //                     assert.equal(users[0].role.name, "moderator");
      //                 }
      //                 else if (status === "room-join") {
      //                     // happens when someone else joins
      //                     assert.equal(2, users.length);
      //                     let userGeorge: UserRole = users.find(u => u.name === george);
      //                     assert.equal(userGeorge.name, george);
      //                     assert.equal(userGeorge.role.name, "moderator");
      //                     let userJohn: UserRole = users.find(u => u.name === john);
      //                     assert.equal(userJohn.name, john);
      //                     assert.equal(userJohn.role.name, "guest");
      //                 }
      //             });
      //
      //             client.on(UsersAllEvent.eventName, (users: number) => {
      //                 if (status === "room-create") {
      //                     // happens when current socket creates room
      //                     assert.equal(1, users);
      //                 }
      //                 else if (status === "room-join") {
      //                     // happens when someone else joins
      //                     assert.equal(2, users);
      //                 }
      //             });
      //
      //             // act
      //             client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($create: CreateRoomCallbackArgs) => {
      //                 status = "room-create";
      //                 roomJoinEventArgs = { roomId: $create.roomId, name: john };
      //                 roomJoinEvent = new RoomJoinEvent(roomJoinEventArgs);
      //
      //                 // someone else is connected and joins room
      //                 let newClient = ioClient.connect(socketUrl, options);
      //                 newClient.on("connect", () => {
      //                     status = "room-join";
      //                     newClient.on(RoomShowAllEvent.eventName, (users: UserRole[]) => {
      //                         // when he joins, room will have two users, including him
      //                         assert.equal(2, users.length);
      //                         let userGeorge: UserRole = users.find(u => u.name === george);
      //                         assert.equal(userGeorge.name, george);
      //                         assert.equal(userGeorge.role.name, "moderator");
      //                         let userJohn: UserRole = users.find(u => u.name === john);
      //                         assert.equal(userJohn.name, john);
      //                         assert.equal(userJohn.role.name, "guest");
      //                     });
      //
      //                     newClient.on(UsersAllEvent.eventName, (users: number) => {
      //                         assert.equal(2, users);
      //                         newClient.disconnect();
      //                         done();
      //                     });
      //
      //                     newClient.emit(RoomJoinEvent.eventName, roomJoinEvent.data, ($value: RoomJoinCallbackArgs) => {
      //                         assert.isTrue($value.access);
      //                     });
      //                 });
      //             });
      //         });
      //     });
      // });
    })
  })
})
