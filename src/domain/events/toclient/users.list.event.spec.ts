import { expect } from 'chai'
import { UsersListEvent } from './users.list.event'
import { ExportedUser } from '../../index'

describe('Events', () => {
  describe('UsersListEvent', () => {
    it("should have 'users-list' event as name", () => {
      expect(UsersListEvent.eventName).to.equal('users-list')
    })

    it('should initialize exportedUsers object', () => {
      // arrange
      const exportedUsers: ExportedUser[] = [
        { name: 'Usain', color: '#FFFF00' },
        { name: 'Bob', color: '#333' },
      ]

      // act
      let usersList = new UsersListEvent(exportedUsers)

      // assert
      expect(usersList.exportedUsers).to.not.be.undefined
      expect(usersList.exportedUsers).to.have.length(2)
      expect(usersList.exportedUsers).to.equal(exportedUsers)
    })
  })
})
