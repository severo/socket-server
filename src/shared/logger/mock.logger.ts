export class MockLogger {
  constructor(
    private errorLogs: string[] = [],
    private infoLogs: string[] = []
  ) {}

  public error = (context: string, message?: string): void => {
    this.errorLogs.push(MockLogger.forgeLog(context, message))
  }
  public info = (context: string, message?: string): void => {
    this.infoLogs.push(MockLogger.forgeLog(context, message))
  }

  public static forgeLog = (context: string, message?: string): string =>
    message ? `${context} - ${message}` : context

  public getErrorLogs(): string[] {
    return this.errorLogs
  }
  public getInfoLogs(): string[] {
    return this.infoLogs
  }
}
