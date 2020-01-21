import { Event } from './event'

export class UpdateUserColorEvent {
  static readonly eventName: string = Event.UpdateUserColor
  constructor(public readonly data: { color: string }) {}
}
