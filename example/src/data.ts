import { Event, EventId, Lane, LaneId } from '../..'
import { List as ImmutableList } from 'immutable'

const laneIdOne = 'lane-id-one' as LaneId
const laneIdTwo = 'lane-id-two' as LaneId

const eventIdOne = 'event-id-one' as EventId
const eventIdTwo = 'event-id-two' as EventId

export const lanes = ImmutableList.of<Lane>(
    { laneId: laneIdOne, label: 'Lane One' },
    {
        laneId: laneIdTwo,
        label: 'Lane Two'
    }
)

export const events = ImmutableList.of<Event>(
    { eventId: eventIdOne, laneId: laneIdOne, startTimeMillis: Date.now() },
    { eventId: eventIdTwo, laneId: laneIdTwo, startTimeMillis: Date.now() }
)
