import { ConnectionEvent } from '../domain/events'

class Socket {
  private io: SocketIO.Server
  constructor(io: SocketIO.Server) {
    this.io = io
  }

  public connect() {
    this.io
      .of('/occupapp-beta')
      .on(ConnectionEvent.eventName, (socket: SocketIOClient.Socket) => {
        // socket.on(
        //   'update-profile',
        //   () => console.log('ok')
        //   //updateProfile(socket.id, profile, ack)
        // )
        // rooms (unique room)
        // socket.on('join', (userProfile, ack) => {
        //   if (socket.rooms.includes(uniqueRoom)) {
        //     ack({'status': 'error', 'reason': "Already in the room 'default room'"})
        //   }
        //   socket.join(uniqueRoom, () => {
        //     // Add or update the guest in the list of
        //     addGuest(socket, guestData, ack))
        //
        //     let rooms = Object.keys(socket.rooms);
        //     console.log(rooms); // [ <socket.id>, 'room 237' ]
        //     io.to('room 237').emit('a new user has joined the room'); // broadcast to everyone in the room
        //   });
        // }
        // // socket.on('update-urlqueryspec', onUpdateUrlQuerySpec(socket))
        // socket.on('disconnecting', () => removeGuest(socket))
      })
  }
}

export { Socket }
