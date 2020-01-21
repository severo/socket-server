import ioClient from 'socket.io-client'
import io from 'socket.io'
import { expect } from 'chai'

import { MockLogger } from '../shared/index'
import { Socket } from './socket'
import {
  // ConnectionEvent,
  // InternalServerErrorEvent,
  UpdateUserNameEvent,
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
      })

      describe('update-user-name', () => {
        it('should log info message for empty name and access should be false', (done: Function) => {
          // arrange
          const expectedParameter: string = 'name'
          const updateUserNameEventArgs: { name: string } = { name: '' }
          const updateUserNameEvent = new UpdateUserNameEvent(
            updateUserNameEventArgs
          )

          Promise.all([
            new Promise((resolve, reject) =>
              client.on('connect', () => {
                // act
                client.emit(
                  UpdateUserNameEvent.eventName,
                  updateUserNameEvent.data,
                  (value: UpdateUserNameAckArgs) => {
                    try {
                      // assert
                      expect(value).to.not.be.undefined
                      expect(value.updated).to.be.false
                      expect(value.error).to.not.be.undefined

                      expect(value.error.name).to.equal('Error')
                      expect(value.error.message).to.equal(
                        `Parameter <Object>.${expectedParameter} is required`
                      )
                      resolve()
                    } catch (e) {
                      reject(e)
                    }
                  }
                )
              })
            ),
          ])
            .then(() => {
              const errorLogs = mockLogger.getErrorLogs()
              expect(errorLogs).to.have.length(0)
              const infoLogs = mockLogger.getInfoLogs()
              expect(infoLogs).to.have.length(1)
              expect(infoLogs[0]).to.equal(
                `User name could not be updated - Parameter <Object>.${expectedParameter} is required`
              )
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
