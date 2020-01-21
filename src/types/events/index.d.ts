declare interface Exception {
  name: string
  message: string
}

declare interface UpdateUserNameEventArgs {
  name: string
}

declare interface UpdateUserNameAck {
  ($data: UpdateUserNameAckArgs): void
}

declare interface UpdateUserNameAckArgs {
  updated: boolean
  error?: Exception
}

declare interface UpdateUserColorEventArgs {
  color: string
}

declare interface UpdateUserColorAck {
  ($data: UpdateUserColorAckArgs): void
}

declare interface UpdateUserColorAckArgs {
  updated: boolean
  error?: Exception
}

// declare interface RoomJoinEventArgs {
//   roomId: string
//   name: string
// }

// declare interface RoomJoinAck {
//   ($data: RoomJoinAckArgs): void
// }
//
// declare interface RoomJoinAckArgs {
//   access: boolean
//   roomId?: string
//   error?: Error
// }
//
// declare interface RoomDisconnectEventArgs {
//     roomId: string
//     userId: string
// }
//
// declare interface BanEventArgs {
//     roomId: string
//     userId: string
// }
//
//
// declare interface RoomGetAllEventArgs {
//     roomId: string
// }
//
// declare interface RoomBusyEventArgs {
//     roomId: string
// }
//
// declare interface RoomFreeEventArgs {
//     roomId: string
// }
//
// declare interface RoomDeckLockEventArgs {
//     roomId: string
// }
//
// declare interface RoomDeckUnlockEventArgs {
//     roomId: string
// }
//
// declare interface RoomResetEventArgs {
//     roomId: string
// }
//
// declare interface RoomDeckResetEventArgs {
//     roomId: string
// }
//
// declare interface RoomDeckCardAssociateEventArgs {
//     roomId: string,
//     userId: string,
//     cardId: string
// }
//
// declare interface RoomDeckCardAssociateCallbackArgs {
//     associated: boolean
// }
//
// declare interface RoomDeckCardDisassociateEventArgs {
//     roomId: string,
//     userId: string,
//     cardId: string
// }
//
// declare interface RoomDeckCardDisassociateCallbackArgs {
//     disassociated: boolean
// }
//
// declare interface RoomDeckCardAssociateCallback {
//     ($data: RoomDeckCardAssociateCallbackArgs): void
// }
//
// declare interface RoomDeckCardDisassociateCallback {
//     ($data: RoomDeckCardDisassociateCallbackArgs): void
// }
//
// // TODO: Add more events
