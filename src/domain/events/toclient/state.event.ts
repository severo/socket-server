import { EventToClient } from './event.to.client'

export class StateEvent {
  static eventName: string = EventToClient.State
  constructor(public readonly state: string) {}
}
