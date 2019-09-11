import { TimelineEvent, TimelineLane } from '../../dist'

enum TimelineEventIdBrand {}
export type TimelineEventId = { __brand: TimelineEventIdBrand } & string

enum TimelineLaneIdBrand {}
export type TimelineLaneId = { __brand: TimelineLaneIdBrand } & string

export type ExampleLane = TimelineLane<TimelineLaneId>
export type ExampleEvent = TimelineEvent<TimelineEventId, TimelineLaneId>
