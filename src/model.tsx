import * as React from 'react'

export interface TimelineEvent<EID, LID> {
  eventId: EID
  startTimeMillis: number
  endTimeMillis?: number
  laneId: LID
  color?: string
  tooltip?: string
  isSelected?: boolean
  isPinned?: boolean
}

export interface TimelineLane<LID> {
  laneId: LID
  label: string
  color?: string
}

export type Domain = [number, number]

export type EventComponentRole = 'background' | 'foreground'

export type EventComponentFactory<EID, LID> = (
  event: TimelineEvent<EID, LID>,
  role: EventComponentRole,
  timeScale: (ms: number) => number | undefined,
  y: number
) => React.ReactNode

export type Cursor = 'default' | 'zoom-out' | 'zoom-in' | 'ew-resize' | 'grab'
export type LaneDisplayMode = 'expanded' | 'collapsed'
