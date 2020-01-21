import { expect } from 'chai'
import { UpdateUserColorEvent } from './update.user.color.event'

describe('Events', () => {
  describe('UpdateUserColorEvent', () => {
    it("should have 'update-user-color' event as name", () => {
      expect(UpdateUserColorEvent.eventName).to.equal('update-user-color')
    })

    it('should initialize event data', () => {
      // arrange
      let data = { color: '#888444' }

      // act
      let event = new UpdateUserColorEvent(data)

      // assert
      expect(event.data.color).to.equal('#888444')
    })
  })
})
