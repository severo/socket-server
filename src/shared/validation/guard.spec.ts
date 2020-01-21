import { expect } from 'chai'
import { Guard } from './guard'

const message: string = 'Unhandled exception'
describe('Shared', () => {
  describe('Guard', () => {
    describe('throwIfObjectUndefined', () => {
      it('should throw for undefined object', () => {
        expect(() => Guard.throwIfObjectUndefined(undefined, message)).to.throw(
          message
        )
      })

      it('should throw for empty object', () => {
        expect(() => Guard.throwIfObjectUndefined({}, message)).to.throw(
          message
        )
      })

      it('should throw for null object', () => {
        expect(() => Guard.throwIfObjectUndefined(null, message)).to.throw(
          message
        )
      })

      it('should not throw for valid object', () => {
        expect(() =>
          Guard.throwIfObjectUndefined({ name: 'George' }, message)
        ).to.not.throw(message)
      })

      it('should not throw for valid object with undefined values', () => {
        expect(() =>
          Guard.throwIfObjectUndefined({ name: undefined }, message)
        ).to.not.throw(message)
      })

      it('should not throw for valid object with empty values', () => {
        expect(() =>
          Guard.throwIfObjectUndefined({ name: '' }, message)
        ).to.not.throw(message)
      })
    })

    describe('throwIfStringNotDefinedOrEmpty', () => {
      it('should throw for undefined string', () => {
        expect(() =>
          Guard.throwIfStringNotDefinedOrEmpty(undefined, message)
        ).to.throw(message)
      })

      it('should throw for whitespace string', () => {
        expect(() =>
          Guard.throwIfStringNotDefinedOrEmpty(' ', message)
        ).to.throw(message)
      })

      it('should throw for empty string', () => {
        expect(() =>
          Guard.throwIfStringNotDefinedOrEmpty('', message)
        ).to.throw(message)
      })

      it('should throw for null string', () => {
        expect(() =>
          Guard.throwIfStringNotDefinedOrEmpty(null, message)
        ).to.throw(message)
      })

      it('should not throw for valid string', () => {
        expect(() =>
          Guard.throwIfStringNotDefinedOrEmpty('George', message)
        ).to.not.throw(message)
      })
    })

    describe('validate', () => {
      it('should throw for truthy condition', () => {
        expect(() => Guard.validate(true, message)).to.throw(message)
      })

      it('should not throw for falsy condition', () => {
        expect(() => Guard.validate(false, message)).to.not.throw(message)
      })
    })
  })
})
