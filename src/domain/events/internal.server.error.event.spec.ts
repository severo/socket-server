import { expect } from 'chai'
import { InternalServerErrorEvent } from './internal.server.error.event'

describe('Events', () => {
  describe('InternalServerErrorEvent', () => {
    it("should have 'internal-server-error' event as name", () => {
      expect(InternalServerErrorEvent.eventName).to.equal(
        'internal-server-error'
      )
    })

    it('should initialize error object', () => {
      // arrange
      const message = 'Unhandled error'
      const error = new Error(message)

      // act
      let event = new InternalServerErrorEvent(error)

      // assert
      expect(event.error).to.not.be.undefined
      expect(event.error.name).to.equal('Error')
      expect(event.error.message).to.equal(message)
    })
  })
})
