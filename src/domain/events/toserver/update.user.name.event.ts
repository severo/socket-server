import { EventToServer } from './event.to.server'

export class UpdateUserNameEvent {
  static readonly eventName: string = EventToServer.UpdateUserName
  constructor(public readonly data: { name: string }) {}
}
