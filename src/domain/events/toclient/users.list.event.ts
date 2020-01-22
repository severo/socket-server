import { EventToClient } from './event.to.client'
import { ExportedUser } from '../../index'

export class UsersListEvent {
  static eventName: string = EventToClient.UsersList
  // TODO: send less information to the client?
  constructor(public readonly exportedUsers: ExportedUser[]) {}
}
