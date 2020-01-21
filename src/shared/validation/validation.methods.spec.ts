import { expect } from 'chai'
import { isUndefined } from './validation.methods'

describe('Shared', () => {
  describe('isUndefined', () => {
    it('should throw for undefined object', () => {
      expect(isUndefined(undefined)).to.be.true
    })

    it('should throw for empty object', () => {
      expect(isUndefined({})).to.be.true
    })

    it('should throw for null object', () => {
      expect(isUndefined(null)).to.be.true
    })

    it('should not throw for valid object', () => {
      expect(isUndefined({ name: 'George' })).to.be.false
    })
  })
})
