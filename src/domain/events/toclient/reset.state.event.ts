import { EventToClient } from './event.to.client'

export class ResetStateEvent {
  static eventName: string = EventToClient.ResetState
  constructor(public readonly state: string) {}
}
