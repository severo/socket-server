import { expect } from 'chai'
import { UpdateUserNameEvent } from './update.user.name.event'

describe('Events', () => {
  describe('UpdateUserNameEvent', () => {
    it("should have 'update-user-name' event as name", () => {
      expect(UpdateUserNameEvent.eventName).to.equal('update-user-name')
    })

    it('should initialize event data', () => {
      // arrange
      let data = { name: 'George' }

      // act
      let event = new UpdateUserNameEvent(data)

      // assert
      expect(event.data.name).to.equal('George')
    })
  })
})
