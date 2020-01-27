import Automerge from 'automerge'
import { Constants } from './constants'
import { Guard, ConsoleLogger } from '../shared/index'
import {
  ConnectEvent,
  DisconnectEvent,
  UpdateStateEvent,
  UpdateUserNameEvent,
  UpdateUserColorEvent,
} from '../domain/events/toserver'
import {
  ResetStateEvent,
  SendStateEvent,
  UsersListEvent,
} from '../domain/events/toclient'
import { ExportedUser, User } from '../domain'

class Socket {
  private users: Map<SocketIO.Socket['id'], User> = new Map()
  private state = Automerge.init()

  constructor(private io: SocketIO.Server, private log = new ConsoleLogger()) {}

  public connect() {
    this.io
      .of('/occupapp-beta')
      .on(ConnectEvent.eventName, (socket: SocketIO.Socket) => {
        this.log.info(`Connection from socket ${socket.id}`)

        // Note that a new socket (and this socket.id) is created on each
        // connection. There is no persistence for a same user between
        // connections
        const socketUser: User = this.createUser(socket.id)
        if (this.users.size === 1) {
          this.emitSendStateToUser(socket)
        } else {
          this.emitUsersListToAll()
          this.emitResetStateToUser(socket)
        }

        socket.on(DisconnectEvent.eventName, (reason: string) => {
          this.log.info(
            `Disconnection from socket ${socket.id} - reason: ${reason}`
          )
          if (this.removeUser(socket.id)) {
            // TODO: alternative: send mutation : user-removed
            this.emitUsersListToAll()
          }
        })

        socket.on(
          UpdateUserNameEvent.eventName,
          (data: UpdateUserNameEventArgs, ack: UpdateUserNameAck) => {
            try {
              updateUserName(data, ack)
            } catch (error) {
              this.log.info('User name could not be updated', error.message)
              ack({
                updated: false,
                error: this.toException(error),
              })
            }
          }
        )

        const updateUserName = (
          data: UpdateUserNameEventArgs,
          ack: UpdateUserNameAck
        ) => {
          Guard.throwIfObjectUndefined(data, Constants.dataIsRequired)
          Guard.throwIfStringNotDefinedOrEmpty(
            data.name,
            Constants.dataNameIsRequired
          )
          socketUser.name = data.name

          // TODO: alternative: send mutation : user-name-updated
          this.emitUsersListToAll()

          this.log.info('User name updated')
          ack({ updated: true })
        }

        socket.on(
          UpdateUserColorEvent.eventName,
          (data: UpdateUserColorEventArgs, ack: UpdateUserColorAck) => {
            try {
              updateUserColor(data, ack)
            } catch (error) {
              this.log.info('User color could not be updated', error.message)
              ack({
                updated: false,
                error: this.toException(error),
              })
            }
          }
        )

        const updateUserColor = (
          data: UpdateUserColorEventArgs,
          ack: UpdateUserColorAck
        ) => {
          Guard.throwIfObjectUndefined(data, Constants.dataIsRequired)
          Guard.throwIfStringNotDefinedOrEmpty(
            data.color,
            Constants.dataColorIsRequired
          )
          Guard.throwIfStringNotAnHexColor(
            data.color,
            Constants.dataColorHasNotHexFormat
          )
          socketUser.color = data.color

          // TODO: alternative: send mutation : user-color-updated
          this.emitUsersListToAll()

          this.log.info('User color updated')
          ack({ updated: true })
        }

        socket.on(
          UpdateStateEvent.eventName,
          (data: UpdateStateEventArgs, ack: UpdateStateAck) => {
            try {
              updateState(data, ack)
            } catch (error) {
              this.log.info('State could not be updated', error.message)
              ack({
                updated: false,
                error: this.toException(error),
              })
            }
          }
        )

        const updateState = (
          data: UpdateStateEventArgs,
          ack: UpdateStateAck
        ) => {
          // We let automerge throw if the data is malformed
          // By the way, the state is persisted locally to send to the next
          // client that will connect
          this.state = Automerge.applyChanges(this.state, data)

          // Send to the other users in the namespace
          this.emitUpdateStateToOthers(socket, data)

          this.log.info('State updated')
          ack({ updated: true })
        }
      })
  }

  private createUser = (id: SocketIO.Socket['id']): User => {
    const newUser = new User(id)
    this.users.set(id, newUser)
    this.log.info(`createUser`, `New user created (client socket ${id})`)
    return newUser
  }

  private removeUser = (id: SocketIO.Socket['id']): boolean => {
    const removed: boolean = this.users.delete(id)
    if (removed) {
      this.log.info(`removeUser`, `User removed (client socket ${id})`)
    }
    return removed
  }

  private emitUsersListToAll() {
    // TODO: add log?
    const usersListEvent = new UsersListEvent(this.exportedUsers)
    this.io
      .of('/occupapp-beta')
      .emit(UsersListEvent.eventName, usersListEvent.exportedUsers)
  }

  private get exportedUsers(): ExportedUser[] {
    return [...this.users.values()].map(user => user.export())
  }

  private emitResetStateToUser(socket: SocketIO.Socket) {
    // TODO: add log?
    const resetStateEvent = new ResetStateEvent(this.savedAutomergeState)
    socket.emit(ResetStateEvent.eventName, resetStateEvent.state)
  }

  private emitSendStateToUser(socket: SocketIO.Socket) {
    // TODO: add log?
    socket.emit(SendStateEvent.eventName, (args: SendStateAckArgs) => {
      if (args.sent === false) {
        this.log.info(
          'State has not been returned by the client',
          args.error ? args.error.message : 'no error sent by the client'
        )
      }

      try {
        this.state = Automerge.load(args.state)
      } catch (error) {
        this.log.info('State could not be loaded', error.message)
      }

      // Send to the other users in the namespace (if there are other users)
      this.emitResetStateToOthers(socket)

      this.log.info('State reset from client')
    })
  }

  private emitResetStateToOthers(socket: SocketIO.Socket) {
    // TODO: add log?
    const resetStateEvent = new ResetStateEvent(this.savedAutomergeState)
    socket.broadcast.emit(ResetStateEvent.eventName, resetStateEvent.state)
  }

  private emitUpdateStateToOthers(
    socket: SocketIO.Socket,
    data: UpdateStateEventArgs
  ) {
    // TODO: add log?
    const updateStateEvent = new UpdateStateEvent(data)
    socket.broadcast.emit(UpdateStateEvent.eventName, updateStateEvent.data)
  }

  private get savedAutomergeState(): string {
    return Automerge.save(this.state)
  }

  private toException = (error: Error): Exception => {
    return {
      message: error.message,
      name: error.name,
    }
  }
}

export { Socket }
