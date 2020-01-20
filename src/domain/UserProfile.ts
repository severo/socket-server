// const nanoid = require('nanoid')
// const rnd = require('randomcolor')
// const Joi = require('@hapi/joi')
//
// // Defaults
// const randomName = () => nanoid(5)
// const randomColor = () => rnd({ luminosity: 'dark' })
// // Check
// const checkProfile = Joi.object({
//   name: Joi.string().min(1),
//   color: Joi.string().pattern(new RegExp('^#(?:[0-9a-fA-F]{3}){1,2}$')),
// })
//
// class UserProfile {
//   #name = randomName()
//   #color = randomColor()
//   constructor(profile) {
//     this.updateWith(profile)
//   }
//   updateWith(profile) {
//     const checkedProfile = UserProfile.checkProfile(profile)
//     if (checkedProfile.error !== undefined) {
//       throw checkedProfile.error
//     }
//     if (checkedProfile.name) {
//       this.#name = checkedProfile.name
//     }
//     if (checkedProfile.color) {
//       this.#color = checkedProfile.color
//     }
//     return this
//   }
//   // Provide the check as a static method, so that it can be used by outer code
//   static checkProfile(profile) {
//     return checkProfile(profile)
//   }
//   get name() {
//     return this.#name
//   }
//   get color() {
//     return this.#color
//   }
// }
//
// module.exports = { UserProfile }
