import { expect } from 'chai'
import { ConsoleLogger } from './console.logger'

describe('Loggers', () => {
  describe('ConsoleLogger', () => {
    it('should log info and errors', done => {
      // arrange
      const errors = [
        { context: 'in a function', message: 'undefined variable' },
      ]
      const infos = [
        { context: 'at startup', message: 'server started normally' },
        { context: 'at shutdown', message: 'server stopped normally' },
      ]
      const logger = new ConsoleLogger()

      // act
      try {
        logger.info(infos[0].context, infos[0].message)
        logger.error(errors[0].context, errors[0].message)
        logger.info(infos[1].context, infos[1].message)
        done()
      } catch (e) {
        done(e)
      }
    })

    it('should throw if accesssing getErrorLogs or getInfoLogs', () => {
      // arrange
      const logger = new ConsoleLogger()

      // assert
      try {
        logger.getInfoLogs()
      } catch (e) {
        expect(e).to.not.be.undefined
        expect(e).to.have.property('name', 'ReferenceError')
        expect(e).to.have.property('message', 'Not implemented')
      }
      try {
        logger.getErrorLogs()
      } catch (e) {
        expect(e).to.not.be.undefined
        expect(e).to.have.property('name', 'ReferenceError')
        expect(e).to.have.property('message', 'Not implemented')
      }
    })
  })
})
