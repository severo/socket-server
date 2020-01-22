import { expect } from 'chai'
import { UpdateUserNameEvent } from './update.user.name.event'

describe('Events', () => {
  describe('UpdateUserNameEvent', () => {
    it("should have 'update-user-name' event as name", () => {
      expect(UpdateUserNameEvent.eventName).to.equal('update-user-name')
    })

    it('should initialize event data', () => {
      // arrange
      const data = { name: 'George' }

      // act
      const event = new UpdateUserNameEvent(data)

      // assert
      expect(event.data.name).to.equal('George')
    })
  })
})
