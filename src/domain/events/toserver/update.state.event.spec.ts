import { expect } from 'chai'
import { UpdateStateEvent } from './update.state.event'
import Automerge from 'automerge'

describe('Events', () => {
  describe('UpdateStateEvent', () => {
    it("should have 'update-state' event as name", () => {
      expect(UpdateStateEvent.eventName).to.equal('update-state')
    })
    it('should initialize an array of Change objects', () => {
      // arrange
      const changes: Automerge.Change[] = [
        {
          ops: [
            {
              action: 'makeList',
              obj: 'be89e397-324c-4bec-932a-ae087a3177de',
            },
            {
              action: 'ins',
              obj: 'be89e397-324c-4bec-932a-ae087a3177de',
              key: '_head',
              elem: 1,
            },
            {
              action: 'makeMap',
              obj: '8b94a2c5-98c3-4ed9-8a18-ccae369cf168',
            },
            {
              action: 'set',
              obj: '8b94a2c5-98c3-4ed9-8a18-ccae369cf168',
              key: 'x',
              value: 1,
            },
            {
              action: 'set',
              obj: '8b94a2c5-98c3-4ed9-8a18-ccae369cf168',
              key: 'y',
              value: 2,
            },
            {
              action: 'link',
              obj: 'be89e397-324c-4bec-932a-ae087a3177de',
              key: 'b6336846-12b7-4d8c-a4ab-949a3afd1903:1',
              value: '8b94a2c5-98c3-4ed9-8a18-ccae369cf168',
            },
            {
              action: 'link',
              obj: '00000000-0000-0000-0000-000000000000',
              key: 'points',
              value: 'be89e397-324c-4bec-932a-ae087a3177de',
            },
            {
              action: 'set',
              obj: '00000000-0000-0000-0000-000000000000',
              key: 'imageSrc',
              value: 'lake.png',
            },
          ],
          actor: 'b6336846-12b7-4d8c-a4ab-949a3afd1903',
          seq: 1,
          deps: {},
        },
      ]

      // act
      const event = new UpdateStateEvent(changes)

      // assert
      expect(event.data).to.deep.equal(changes)
    })
  })
})
