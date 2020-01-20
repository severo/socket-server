import http from 'http'
import express from 'express'
import socketIo from 'socket.io'
import { Socket } from './socket.io/socket'

// const { RateLimiterMemory } = require('rate-limiter-flexible')

//
// const { Room } = require('./Room.js')
// const { User } = require('./User.js')

// TODO: add a public page that redirects to the GitHub repository
// app.use(express.static(__dirname + '/public'))

// const rateLimiter = new RateLimiterMemory({
//   points: 2, // 2 points
//   duration: 1 // per second
// })
//
// const chat = io.on('connection', socket => {
//   socket.on('chat', data => {
//     // console.log(`Message received: ${data}`)
//     socket.broadcast.emit('chat', data)
//   })
// })
//
// // state
// // TODO: it would be better to use the underlying state socket.io manages, but...
// // it seems to be difficult to access it (eg. getting the list of sockets for a
// // given room)
// // The current solution is to replicate this state, even if it implies having
// // ghosts users after some time, when a user has not disconnected properly.
// // current solution -> expiration date, and deleting these users
//
// const addRoom = (room) => {
//   if (!rooms.has(room.name)) {
//     rooms.set(room.name, room)
//   }
// }
// const rooms = new Map()
// const uniqueRoomName = 'default room'
// const uniqueRoom = new Room(uniqueRoomName)
// addRoom(uniqueRoom)
//
// let urlQuerySpec = {}
//
// // const onUpdateUrlQuerySpec = socket => async (newUrlQuerySpec, ack) => {
// //   console.log('new urlQuerySpec')
// //   try {
// //     await rateLimiter.consume(socket.id) // consume 1 point per event from IP
// //     const guest = guests.get(socket.id)
// //     if (guest !== undefined) {
// //       touch(guest)
// //       if (urlQuerySpec !== newUrlQuerySpec) {
// //         // ?
// //         urlQuerySpec = newUrlQuerySpec
// //         socket.broadcast.emit('urlqueryspec', urlQuerySpec)
// //       }
// //       ack(urlQuerySpec)
// //     }
// //     console.log('OK')
// //   } catch (rejRes) {
// //     // no available points to consume
// //     // emit error or warning message
// //     socket.emit('blocked', { 'retry-ms': rejRes.msBeforeNext })
// //     console.log('Blocked')
// //   }
// // }
// const removeGuest = (room, socket) => {
//   if (room.deleteUser(socket.id)) {
//     emitProfilesList(room)
//   }
// }
//
// const emitProfilesList = (room) => {
//   // Clean the list, pruning expired users
//   room.pruneExpiredUsers()
//   // Send the list to everybody in the room
//   io.of('/occupapp-beta').to(room.name).emit('list-profiles', room.profiles)
// }
//
// const updateProfile = (socketId: SocketIOClient.Socket['id'], profile, ack) => {
//   // Validate payload
//   const checkedProfile = UserProfile.checkProfile(profile)
//   if (checkedProfile.error !== undefined) {
//     ack({ status: 'error', error: checkedProfile.error })
//   }
//
//   // Create or update user
//   // TODO: update the user profile independently from its room
//   const currentUser = uniqueRoom.getUser(socketId)
//   if (currentUser === undefined) {
//     const user = new User(socketId, new UserProfile(checkedProfile))
//     uniqueRoom.setUser(user)
//     emitProfilesList(uniqueRoom)
//     ack({ status: 'success', data: user.profile })
//   } else {
//     currentUser.profile.updateWith(checkProfile)
//     uniqueRoom.setUser(currentUser)
//     // TODO: only notify everybody if something has changed in the profile
//     emitProfilesList(uniqueRoom)
//     ack({ status: 'success', data: currentUser.profile })
//   }
// }

const port: number = +process.env.PORT || 3000
const app: express.Application = express()
const server = http.createServer(<any>app)
const io = socketIo(server)
const socketServer = new Socket(io)

if (require.main === module) {
  socketServer.connect()
  server.listen(port)
}

// export the server so it can be easily called for testing
export { server, socketServer }
