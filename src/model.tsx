enum EventIdBrand {}

export type EventId = { __brand: EventIdBrand } & string

export type Event = Readonly<{
    eventId: EventId
    startTimeMillis: number
    endTimeMillis?: number
    laneId: LaneId
    color?: string
    tooltip?: string
    isSelected?: boolean
    isPinned?: boolean
}>

enum LaneIdBrand {}

export type LaneId = { __brand: LaneIdBrand } & string

export type Lane = Readonly<{
    laneId: LaneId
    label: string
    color?: string
}>

export type Domain = [number, number]
