import { expect } from 'chai'
import { ResetStateEvent } from './reset.state.event'

describe('Events', () => {
  describe('ResetStateEvent', () => {
    it("should have 'reset-state' event as name", () => {
      expect(ResetStateEvent.eventName).to.equal('reset-state')
    })
    it('should initialize a string', () => {
      // arrange
      const state: string = `["~#iL",[]]`

      // act
      const event = new ResetStateEvent(state)

      // assert
      expect(event.state).to.deep.equal(state)
    })
  })
})
