import ioClient from 'socket.io-client'
import io from 'socket.io'
import { default as chai, expect } from 'chai'
import chaiThings from 'chai-things'
chai.should()
chai.use(chaiThings)

import { MockLogger } from '../shared/index'
import { Socket } from './socket'
import {
  // ConnectionEvent,
  // InternalServerErrorEvent,
  UpdateUserNameEvent,
  UpdateUserColorEvent,
} from '../domain/events'

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
      let mockLogger: MockLogger

      beforeEach(() => {
        server = io().listen(5000)
        mockLogger = new MockLogger()
        socket = new Socket(server, mockLogger)
        socket.connect()
        client = ioClient.connect(socketUrl + '/occupapp-beta', options)
      })

      afterEach(() => {
        client.close()
        server.close()
      })

      describe('connect', () => {
        it('should connect socket', (done: Function) => {
          client.on('connect', () => {
            expect(client.connected).to.be.true
            client.disconnect()
            done()
          })
        })
        it('should create a new user', () => {
          new Promise(resolve => client.on('connect', resolve))
            .then(() => {
              const logs = mockLogger.getInfoLogs()
              logs.should.include.something.that.have.string(
                'New user created for socket'
              )
            })
            .then(() => client.disconnect())
        })
      })

      describe('update-user-name', () => {
        it('should log info message for empty data and updated should be false', (done: Function) => {
          // arrange
          const updateUserNameEventArgs: undefined = undefined
          const updateUserNameEvent = new UpdateUserNameEvent(
            updateUserNameEventArgs
          )

          new Promise(resolve =>
            client.on('connect', () => {
              // act
              client.emit(
                UpdateUserNameEvent.eventName,
                updateUserNameEvent.data,
                (value: UpdateUserNameAckArgs) => resolve(value)
              )
            })
          )
            .then((value: UpdateUserNameAckArgs) => {
              // assert
              expect(value).to.not.be.undefined
              expect(value).to.have.property('updated', false)
              expect(value).to.have.property('error')
              expect(value.error).to.have.property('name', 'Error')
              expect(value.error).to.have.property(
                'message',
                `Parameter data is required`
              )

              const logs = mockLogger.getInfoLogs()
              logs.should.include.something.that.equals(
                `User name could not be updated - Parameter data is required`
              )
              done()
            })
            .catch(e => done(e))
        })

        it('should log info message for empty name and updated should be false', (done: Function) => {
          // arrange
          const updateUserNameEventArgs: UpdateUserNameEventArgs = { name: '' }
          const updateUserNameEvent = new UpdateUserNameEvent(
            updateUserNameEventArgs
          )

          new Promise(resolve =>
            client.on('connect', () => {
              // act
              client.emit(
                UpdateUserNameEvent.eventName,
                updateUserNameEvent.data,
                (value: UpdateUserNameAckArgs) => resolve(value)
              )
            })
          )
            .then((value: UpdateUserNameAckArgs) => {
              // assert
              expect(value).to.not.be.undefined
              expect(value).to.have.property('updated', false)
              expect(value).to.have.property('error')
              expect(value.error).to.have.property('name', 'Error')
              expect(value.error).to.have.property(
                'message',
                `Parameter <Object>.name is required`
              )

              const logs = mockLogger.getInfoLogs()
              logs.should.include.something.that.equals(
                `User name could not be updated - Parameter <Object>.name is required`
              )
              done()
            })
            .catch(e => done(e))
        })

        it('should log info message for correct name, updated should be true and error should not exist', (done: Function) => {
          // arrange
          const updateUserNameEventArgs: UpdateUserNameEventArgs = {
            name: 'George',
          }
          const updateUserNameEvent = new UpdateUserNameEvent(
            updateUserNameEventArgs
          )

          new Promise(resolve =>
            client.on('connect', () => {
              // act
              client.emit(
                UpdateUserNameEvent.eventName,
                updateUserNameEvent.data,
                (value: UpdateUserNameAckArgs) => resolve(value)
              )
            })
          )
            .then((value: UpdateUserNameAckArgs) => {
              // assert
              expect(value).to.not.be.undefined
              expect(value).to.have.property('updated', true)
              expect(value).to.not.have.property('error')

              const logs = mockLogger.getInfoLogs()
              logs.should.include.something.that.equals(`User name updated`)
              done()
            })
            .catch(e => done(e))
        })
      })

      describe('update-user-color', () => {
        it('should log info message for empty data and updated should be false', (done: Function) => {
          // arrange
          const updateUserColorEventArgs: undefined = undefined
          const updateUserColorEvent = new UpdateUserColorEvent(
            updateUserColorEventArgs
          )

          new Promise(resolve =>
            client.on('connect', () => {
              // act
              client.emit(
                UpdateUserColorEvent.eventName,
                updateUserColorEvent.data,
                (value: UpdateUserColorAckArgs) => resolve(value)
              )
            })
          )
            .then((value: UpdateUserColorAckArgs) => {
              // assert
              expect(value).to.not.be.undefined
              expect(value).to.have.property('updated', false)
              expect(value).to.have.property('error')
              expect(value.error).to.have.property('name', 'Error')
              expect(value.error).to.have.property(
                'message',
                `Parameter data is required`
              )

              const logs = mockLogger.getInfoLogs()
              logs.should.include.something.that.equals(
                `User color could not be updated - Parameter data is required`
              )
              done()
            })
            .catch(e => done(e))
        })

        it('should log info message for empty color and updated should be false', (done: Function) => {
          // arrange
          const updateUserColorEventArgs: UpdateUserColorEventArgs = {
            color: '',
          }
          const updateUserColorEvent = new UpdateUserColorEvent(
            updateUserColorEventArgs
          )

          new Promise(resolve =>
            client.on('connect', () => {
              // act
              client.emit(
                UpdateUserColorEvent.eventName,
                updateUserColorEvent.data,
                (value: UpdateUserColorAckArgs) => resolve(value)
              )
            })
          )
            .then((value: UpdateUserColorAckArgs) => {
              // assert
              expect(value).to.not.be.undefined
              expect(value).to.have.property('updated', false)
              expect(value).to.have.property('error')
              expect(value.error).to.have.property('name', 'Error')
              expect(value.error).to.have.property(
                'message',
                `Parameter <Object>.color is required`
              )

              const logs = mockLogger.getInfoLogs()
              logs.should.include.something.that.equals(
                `User color could not be updated - Parameter <Object>.color is required`
              )
              done()
            })
            .catch(e => done(e))
        })

        it('should log info message for invalid color and updated should be false', (done: Function) => {
          // arrange
          const updateUserColorEventArgs: UpdateUserColorEventArgs = {
            color: '1235g',
          }
          const updateUserColorEvent = new UpdateUserColorEvent(
            updateUserColorEventArgs
          )

          new Promise(resolve =>
            client.on('connect', () => {
              // act
              client.emit(
                UpdateUserColorEvent.eventName,
                updateUserColorEvent.data,
                (value: UpdateUserColorAckArgs) => resolve(value)
              )
            })
          )
            .then((value: UpdateUserColorAckArgs) => {
              // assert
              expect(value).to.not.be.undefined
              expect(value).to.have.property('updated', false)
              expect(value).to.have.property('error')
              expect(value.error).to.have.property('name', 'Error')
              expect(value.error).to.have.property(
                'message',
                `Parameter <Object>.color has not an hexadecimal color format`
              )

              const logs = mockLogger.getInfoLogs()
              logs.should.include.something.that.equals(
                `User color could not be updated - Parameter <Object>.color has not an hexadecimal color format`
              )
              done()
            })
            .catch(e => done(e))
        })

        it('should log info message for correct name, updated should be true and error should not exist', (done: Function) => {
          // arrange
          const updateUserColorEventArgs: UpdateUserColorEventArgs = {
            color: '#123BCA',
          }
          const updateUserColorEvent = new UpdateUserColorEvent(
            updateUserColorEventArgs
          )

          new Promise(resolve =>
            client.on('connect', () => {
              // act
              client.emit(
                UpdateUserColorEvent.eventName,
                updateUserColorEvent.data,
                (value: UpdateUserColorAckArgs) => resolve(value)
              )
            })
          )
            .then((value: UpdateUserColorAckArgs) => {
              // assert
              expect(value).to.not.be.undefined
              expect(value).to.have.property('updated', true)
              expect(value).to.not.have.property('error')

              const logs = mockLogger.getInfoLogs()
              logs.should.include.something.that.equals(`User color updated`)
              done()
            })
            .catch(e => done(e))
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
