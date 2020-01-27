import { expect } from 'chai'
import { MockLogger } from './mock.logger'

describe('Loggers', () => {
  describe('MockLogger', () => {
    it('should initialize empty logs', () => {
      // act
      const logger = new MockLogger()

      // assert
      expect(logger.getErrorLogs()).to.have.length(0)
      expect(logger.getInfoLogs()).to.have.length(0)
    })

    it('should concatenate context and message (if present)', () => {
      // arrange
      const strings = [
        { context: 'in a function', message: 'undefined variable' },
        { context: 'at shutdown', message: 'server stopped normally' },
        { context: 'at shutdown' },
      ]

      // assert
      expect(
        MockLogger.forgeLog(strings[0].context, strings[0].message)
      ).to.equal('in a function - undefined variable')
      expect(
        MockLogger.forgeLog(strings[1].context, strings[1].message)
      ).to.equal('at shutdown - server stopped normally')
      expect(
        MockLogger.forgeLog(strings[2].context, strings[2].message)
      ).to.equal('at shutdown')
    })

    it('should keep track of error and info logs', () => {
      // arrange
      const errors = [
        { context: 'in a function', message: 'undefined variable' },
      ]
      const infos = [
        { context: 'at startup', message: 'server started normally' },
        { context: 'at shutdown', message: 'server stopped normally' },
      ]
      const logger = new MockLogger()

      // act
      logger.info(infos[0].context, infos[0].message)
      logger.error(errors[0].context, errors[0].message)
      logger.info(infos[1].context, infos[1].message)

      // assert
      const loggedErrors = logger.getErrorLogs()
      const loggedInfos = logger.getInfoLogs()
      expect(loggedErrors).to.have.length(1)
      expect(loggedErrors[0]).to.equal('in a function - undefined variable')
      expect(loggedInfos).to.have.length(2)
      expect(loggedInfos[0]).to.equal('at startup - server started normally')
      expect(loggedInfos[1]).to.equal('at shutdown - server stopped normally')
    })
  })
})
