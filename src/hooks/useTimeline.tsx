import { useEffect, useState } from 'react'

import { useZoomLevels } from './useZoomLevels'

import { Domain, TimelineEvent, TimelineLane, ZoomLevels } from '..'
import { ScaleBand, scaleBand, ScaleLinear, scaleLinear } from 'd3-scale'

const calcMaxDomain = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>(
  events: ReadonlyArray<E>
): Domain => {
  const timeMin = Math.min(...events.map((e) => e.startTimeMillis))
  const timeMax = Math.max(...events.map((e) => (e.endTimeMillis === undefined ? e.startTimeMillis : e.endTimeMillis)))
  return [timeMin || NaN, timeMax || NaN]
}

interface UseTimelineProps<EID extends string, LID extends string, E extends TimelineEvent<EID, LID>> {
  width: number
  height: number
  events: ReadonlyArray<E>
  lanes: ReadonlyArray<TimelineLane<LID>>
  customRange?: Domain
  zoomLevels: ReadonlyArray<ZoomLevels>
  onZoomRangeChange?: (startMillis: number, endMillis: number) => void
}

export const useTimeline = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>({
  width,
  height,
  events,
  lanes,
  customRange,
  zoomLevels,
  onZoomRangeChange,
}: UseTimelineProps<EID, LID, E>): [
  Domain,
  React.Dispatch<React.SetStateAction<Domain>>,
  Domain,
  number,
  number,
  ZoomLevels,
  ZoomLevels,
  ScaleLinear<number, number>,
  ScaleBand<string>
] => {
  const maxDomain = customRange ?? calcMaxDomain(events)
  const maxDomainStart = maxDomain[0]
  const maxDomainEnd = maxDomain[1]

  const [domain, setDomain] = useState<Domain>(maxDomain) // TODO --> onRangeChange-Event when domain changes?

  const [zoomScale, smallerZoomScale] = useZoomLevels(domain, zoomLevels)

  useEffect(() => {
    setDomain([maxDomainStart, maxDomainEnd])
  }, [maxDomainStart, maxDomainEnd])

  useEffect(() => {
    if (onZoomRangeChange) {
      onZoomRangeChange(...domain)
    }
  }, [domain, onZoomRangeChange])

  const timeScalePadding = 50
  const timeScale = scaleLinear()
    .domain(domain)
    .range([timeScalePadding, width - timeScalePadding])

  const yScale = scaleBand()
    .domain(lanes.map((l) => l.laneId))
    .range([0, height])
    .paddingInner(0.3)
    .paddingOuter(0.8)

  return [domain, setDomain, maxDomain, maxDomainStart, maxDomainEnd, zoomScale, smallerZoomScale, timeScale, yScale]
}
