import { expect } from 'chai'
import { SendStateEvent } from './send.state.event'

describe('Events', () => {
  describe('SendStateEvent', () => {
    it("should have 'send-state' event as name", () => {
      expect(SendStateEvent.eventName).to.equal('send-state')
    })
  })
})
