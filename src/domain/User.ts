// // Ten minutes by default
// const EXPIRATION_DELAY = 10 * 60 * 1000
// class User {
//   #profile
//   #socketId
//   #updated_at
//   #expired_at
//   #expirationDelay
//   constructor(socketId, profile, { expirationDelay = EXPIRATION_DELAY }) {
//     this.#socketId = socketId
//     this.#profile = profile
//     this.#expirationDelay = expirationDelay
//     this.setTimestamp()
//   }
//   get socketId() {
//     return this.#socketId
//   }
//   set socketId(socketId) {
//     this.#socketId = socketId
//   }
//   get profile() {
//     return this.#profile
//   }
//   set profile(profile) {
//     this.#profile = profile
//   }
//   setTimestamp() {
//     const t = Date.now()
//     this.#updated_at = t
//     this.#expired_at = t + this.#expirationDelay
//     return this
//   }
// }
//
// module.exports = { User }
