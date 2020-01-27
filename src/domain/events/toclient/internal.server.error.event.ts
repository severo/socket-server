import { EventToClient } from './event.to.client'

export class InternalServerErrorEvent {
  static eventName: string = EventToClient.InternalServerError
  constructor(public readonly error: Error) {}
}
