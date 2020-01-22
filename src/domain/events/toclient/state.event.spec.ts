import { expect } from 'chai'
import { StateEvent } from './state.event'

describe('Events', () => {
  describe('StateEvent', () => {
    it("should have 'state' event as name", () => {
      expect(StateEvent.eventName).to.equal('state')
    })
    it('should initialize an object', () => {
      // arrange
      const state: object = {
        points: [{ x: 1, y: 2 }],
        imageSrc: 'lake.png',
      }

      // act
      const event = new StateEvent(state)

      // assert
      expect(event.state).to.deep.equal(state)
    })
  })
})
