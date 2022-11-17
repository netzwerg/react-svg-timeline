import { ScaleBand, ScaleLinear } from 'd3-scale'

import { Domain, LaneDisplayMode, TimelineEvent, TimelineEventCluster, TimelineLane } from '../model'
import { ZoomLevels } from '../shared/ZoomScale'

export type TimelineLayerType = 'grid' | 'axes' | 'interaction' | 'marks'

export interface CustomLayerProps<EID extends string, LID extends string, E extends TimelineEvent<EID, LID>> {
  width: number
  height: number
  events: ReadonlyArray<E>
  eventClusters: ReadonlyArray<TimelineEventCluster<LID>>
  lanes: ReadonlyArray<TimelineLane<LID>>
  laneDisplayMode?: LaneDisplayMode
  xScale: ScaleLinear<number, number>
  yScale: ScaleBand<LID>
  domain: Domain
  maxDomain: Domain
  maxDomainStart: number
  maxDomainEnd: number
  currentZoomScale: ZoomLevels
  nextSmallerZoomScale: ZoomLevels
  isAnimationInProgress: boolean
}

export type CustomLayer = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>(
  props: CustomLayerProps<EID, LID, E>
) => React.ReactNode

export type TimelineLayer = TimelineLayerType | CustomLayer
