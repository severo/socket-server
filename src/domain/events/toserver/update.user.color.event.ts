import { EventToServer } from './event.to.server'

export class UpdateUserColorEvent {
  static readonly eventName: string = EventToServer.UpdateUserColor
  constructor(public readonly data: { color: string }) {}
}
