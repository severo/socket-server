import { expect } from 'chai'
import { ConnectEvent } from './connect.event'

describe('Events', () => {
  describe('ConnectEvent', () => {
    it("should have 'connect' event as name", () => {
      expect(ConnectEvent.eventName).to.equal('connect')
    })
  })
})
