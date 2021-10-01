import { TimelineEvent, TimelineLane, TimelineProps } from '../../dist'
import { EventComponentFactory } from '../../src'

enum TimelineEventIdBrand {}
export type TimelineEventId = { __brand: TimelineEventIdBrand } & string

enum TimelineLaneIdBrand {}
export type TimelineLaneId = { __brand: TimelineLaneIdBrand } & string

export type ExampleLane = TimelineLane<TimelineLaneId>
export type ExampleEvent = TimelineEvent<TimelineEventId, TimelineLaneId>

export type ExampleProps = TimelineProps<TimelineEventId, TimelineLaneId, ExampleEvent>
export type ExampleComponentFactory = EventComponentFactory<TimelineEventId, TimelineLaneId, ExampleEvent>
