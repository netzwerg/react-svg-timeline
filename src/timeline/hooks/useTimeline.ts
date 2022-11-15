import { useEffect, useMemo, useState } from 'react'

import { useZoomLevels } from './useZoomLevels'
import { min, max } from 'd3-array'
import { ScaleBand, scaleBand, ScaleLinear, scaleLinear } from 'd3-scale'
import { Domain, TimelineEvent, TimelineLane } from '../model'
import { ZoomLevels } from '../shared/ZoomScale'

export const calcMaxDomain = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>(
  events: ReadonlyArray<E>
): Domain => {
  const timeMin = min(events, (e) => e.startTimeMillis)
  const timeMax = max(events, (e) => (e.endTimeMillis === undefined ? e.startTimeMillis : e.endTimeMillis))
  return [timeMin ?? NaN, timeMax ?? NaN]
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
}: UseTimelineProps<EID, LID, E>): {
  domain: Domain
  setDomain: React.Dispatch<React.SetStateAction<Domain>>
  maxDomain: Domain
  maxDomainStart: number
  maxDomainEnd: number
  currentZoomScale: ZoomLevels
  nextSmallerZoomScale: ZoomLevels
  timeScale: ScaleLinear<number, number>
  yScale: ScaleBand<string>
} => {
  const maxDomain = useMemo(() => customRange ?? calcMaxDomain(events), [events, customRange])
  const maxDomainStart = maxDomain[0]
  const maxDomainEnd = maxDomain[1]

  const [domain, setDomain] = useState<Domain>(maxDomain) // TODO --> onRangeChange-Event when domain changes?

  const { currentZoomScale, nextSmallerZoomScale } = useZoomLevels(domain, zoomLevels)

  useEffect(() => {
    setDomain([maxDomainStart, maxDomainEnd])
  }, [maxDomainStart, maxDomainEnd])

  useEffect(() => {
    if (onZoomRangeChange) {
      onZoomRangeChange(...domain)
    }
  }, [domain, onZoomRangeChange])

  const timeScalePadding = 50
  const timeScale = useMemo(
    () =>
      scaleLinear()
        .domain(domain)
        .range([timeScalePadding, width - timeScalePadding]),
    [domain, width]
  )

  const yScale = useMemo(
    () =>
      scaleBand()
        .domain(lanes.map((l) => l.laneId))
        .range([0, height])
        .paddingInner(0.3)
        .paddingOuter(0.8),
    [lanes, height]
  )

  return {
    domain,
    setDomain,
    maxDomain,
    maxDomainStart,
    maxDomainEnd,
    currentZoomScale,
    nextSmallerZoomScale,
    timeScale,
    yScale,
  }
}
