import { Event } from './event'

export class UpdateUserNameEvent {
  static readonly eventName: string = Event.UpdateUserName
  constructor(public readonly data: { name: string }) {}
}
