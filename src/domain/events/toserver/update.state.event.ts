import { EventToServer } from './event.to.server'
import Automerge from 'automerge'

export class UpdateStateEvent {
  static eventName: string = EventToServer.UpdateState
  constructor(public readonly data: Automerge.Change[]) {}
}
