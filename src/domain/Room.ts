// class Room {
//   #name = 'Default room'
//   #users
//   constructor(name) {
//     this.#name = name
//     this.#users = new Map()
//   }
//   get name() {
//     return this.#name
//   }
//   set name(name) {
//     this.#name = name
//   }
//   get users() {
//     return [...this.#users.values()]
//   }
//   hasUser(userId) {
//     return this.#users.has(userId)
//   }
//   getUser(userId) {
//     return this.#users.get(userId)
//   }
//   setUser(user) {
//     user.setTimestamp()
//     this.#users.set(user.socketId, user)
//     return this
//   }
//   deleteUser(userId) {
//     return this.#users.delete(userId)
//   }
//   pruneExpiredUsers() {
//     for ([id, user] of this.#users) {
//       if (user.hasExpired()) {
//         this.deleteUser(id)
//       }
//     }
//     return this
//   }
//   get profiles() {
//     return this.users.map(user => user.profile)
//   }
// }
//
// module.exports = { Room }
