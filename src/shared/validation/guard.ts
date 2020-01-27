import { isUndefined } from './validation.methods'

export class Guard {
  static throwIfObjectUndefined(data: {}, message: string) {
    this.throwIfConditionIsTruthy(isUndefined(data), message)
  }

  private static throwIfConditionIsTruthy(condition: boolean, message: string) {
    if (condition) {
      throw new Error(message)
    }
  }

  static throwIfStringNotDefinedOrEmpty(value: string, message: string) {
    this.throwIfConditionIsTruthy(
      !value || (value !== null && !value.trim()),
      message
    )
  }

  static throwIfStringNotAnHexColor(value: string, message: string) {
    this.throwIfConditionIsTruthy(
      RegExp('^#(?:[0-9a-fA-F]{3}){1,2}$').test(value) === false,
      message
    )
  }

  static validate(condition: boolean, message: string) {
    this.throwIfConditionIsTruthy(condition, message)
  }
}
