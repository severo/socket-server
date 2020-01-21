import ioClient from 'socket.io-client'
import io from 'socket.io'
import { expect } from 'chai'

import { Socket } from './socket'
// import {
//   ConnectionEvent,
//   InternalServerErrorEvent,
//   UpdateUserNameEvent,
// } from '../domain/events'

const socketUrl: string = 'http://localhost:5000'
const options: SocketIOClient.ConnectOpts = {
  transports: ['websocket'],
  forceNew: true,
}

describe('Server', () => {
  describe('Socket', () => {
    let server: SocketIO.Server
    let socket: Socket
    let client: SocketIOClient.Socket

    beforeEach(() => {
      server = io().listen(5000)
      socket = new Socket(server)
      socket.connect()
      client = ioClient.connect(socketUrl, options)
    })

    afterEach(() => {
      server.close()
      client.close()
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

    //     it("should emit internal-server-error event for empty name and access should be false", (done: Function) => {
    //         // arrange
    //         let expectedParameter: string = "name";
    //         let roomCreateEventArgs: { name: string } = { name: "" };
    //         let roomCreateEvent = new RoomCreateEvent(roomCreateEventArgs);
    //
    //         client.on("connect", () => {
    //             // assert
    //             client.on(InternalServerErrorEvent.eventName, (error: Exception) => {
    //                 assert.isDefined(error.id);
    //                 assert.equal(`Parameter <Object>.${expectedParameter} is required`, error.message);
    //                 assert.equal("Error", error.name);
    //                 done();
    //             });
    //
    //             // act
    //             client.emit(RoomCreateEvent.eventName, roomCreateEvent.data, ($value: CreateRoomCallbackArgs) => {
    //                 assert.equal(false, $value.access);
    //                 assert.isUndefined($value.roomId);
    //             });
    //         });
    //     });
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
