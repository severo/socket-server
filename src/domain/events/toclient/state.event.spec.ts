import { expect } from 'chai'
import { StateEvent } from './state.event'

describe('Events', () => {
  describe('StateEvent', () => {
    it("should have 'state' event as name", () => {
      expect(StateEvent.eventName).to.equal('state')
    })
    it('should initialize a string', () => {
      // arrange
      const state: string = `["~#iL",[]]`

      // act
      const event = new StateEvent(state)

      // assert
      expect(event.state).to.deep.equal(state)
    })
  })
})
