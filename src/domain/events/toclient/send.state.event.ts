import { EventToClient } from './event.to.client'

export class SendStateEvent {
  static eventName: string = EventToClient.SendState
  constructor(public readonly state: string) {}
}
