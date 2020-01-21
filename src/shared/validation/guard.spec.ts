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

    describe('throwIfStringNotAnHexColor', () => {
      it('should throw for undefined string', () => {
        expect(() =>
          Guard.throwIfStringNotAnHexColor(undefined, message)
        ).to.throw(message)
      })

      it('should throw for whitespace string', () => {
        expect(() => Guard.throwIfStringNotAnHexColor(' ', message)).to.throw(
          message
        )
      })

      it('should throw for empty string', () => {
        expect(() => Guard.throwIfStringNotAnHexColor('', message)).to.throw(
          message
        )
      })

      it('should throw for null string', () => {
        expect(() => Guard.throwIfStringNotAnHexColor(null, message)).to.throw(
          message
        )
      })

      it('should throw for an invalid color string', () => {
        expect(() => Guard.throwIfStringNotAnHexColor('1A3', message)).to.throw(
          message
        )
        expect(() =>
          Guard.throwIfStringNotAnHexColor('1A34B6', message)
        ).to.throw(message)
        expect(() =>
          Guard.throwIfStringNotAnHexColor('1A34b6', message)
        ).to.throw(message)
        expect(() =>
          Guard.throwIfStringNotAnHexColor('1A34b608', message)
        ).to.throw(message)
        expect(() =>
          Guard.throwIfStringNotAnHexColor('blue', message)
        ).to.throw(message)
        expect(() =>
          Guard.throwIfStringNotAnHexColor('rgb(0,0,0)', message)
        ).to.throw(message)
        expect(() =>
          Guard.throwIfStringNotAnHexColor('rgba(0,0,0,100)', message)
        ).to.throw(message)
        expect(() =>
          Guard.throwIfStringNotAnHexColor('#1a34B608', message)
        ).to.throw(message)
      })

      it('should not throw for a 3 or 6 digits-long hexadecimal color string', () => {
        expect(() =>
          Guard.throwIfStringNotAnHexColor('#1A3', message)
        ).to.not.throw(message)
        expect(() =>
          Guard.throwIfStringNotAnHexColor('#1A34B6', message)
        ).to.not.throw(message)
        expect(() =>
          Guard.throwIfStringNotAnHexColor('#1a34B6', message)
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
