import { MockLogger } from './mock.logger'

export class ConsoleLogger extends MockLogger {
  public error = (context: string, message: string): void =>
    console.error(MockLogger.forgeLog(context, message))
  public info = (context: string, message: string): void =>
    console.info(MockLogger.forgeLog(context, message))
  public getInfoLogs = (): string[] => {
    throw new ReferenceError('Not implemented')
  }
  public getErrorLogs = (): string[] => {
    throw new ReferenceError('Not implemented')
  }
}
