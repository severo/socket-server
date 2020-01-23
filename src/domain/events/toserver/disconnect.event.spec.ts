import { expect } from 'chai'
import { DisconnectEvent } from './disconnect.event'

describe('Events', () => {
  describe('DisconnectEvent', () => {
    it("should have 'disconnect' event as name", () => {
      expect(DisconnectEvent.eventName).to.equal('disconnect')
    })
  })
})
