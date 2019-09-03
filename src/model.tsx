enum TimelineEventIdBrand {}

export type TimelineEventId = { __brand: TimelineEventIdBrand } & string

export type TimelineEvent = Readonly<{
    eventId: TimelineEventId
    startTimeMillis: number
    endTimeMillis?: number
    laneId: TimelineLaneId
    color?: string
    tooltip?: string
    isSelected?: boolean
    isPinned?: boolean
}>

enum TimelineLaneIdBrand {}

export type TimelineLaneId = { __brand: TimelineLaneIdBrand } & string

export type TimelineLane = Readonly<{
    laneId: TimelineLaneId
    label: string
    color?: string
}>

export type Domain = [number, number]
