import { useCallback, useMemo, useState } from 'react'
import { groups } from 'd3-array'
import { format } from 'date-fns'
import { Domain, TimelineEvent, TimelineEventCluster } from '../model'
import { ZoomScale, ZoomLevels } from '../shared/ZoomScale'

function clusterWidth(scale: ZoomScale): string {
  switch (scale) {
    case ZoomLevels.MAX:
      return 'yyyy'
    case ZoomLevels.TEN_YEARS:
      return 'yyyy-MM'
    case ZoomLevels.ONE_YEAR:
      return 'yyyy-MM-ww'
    case ZoomLevels.ONE_MONTH:
      return 'yyyy-MM-ww-dd'
    case ZoomLevels.ONE_WEEK:
      return 'yyyy-MM-ww-dd-aaa'
    case ZoomLevels.ONE_DAY:
      return 'yyyy-MM-ww-dd-HH'
    case ZoomLevels.MIN:
      return 'T'
    default:
      return 'T'
  }
}

const pinnedOrSelectedGroup = 'isPinnedOrSelected'

// TODO: Don't cluster events with start- AND endTimeMillis if the timespan is larger than the next smaller zoom scale (otherwise there is a possibility, that the event is never fully visible)
// TODO: Toggling between expand/collapse changes cluster sizes; Clusters are displayed proportional within each lane - this could be desired or not -> decide.

export const useEvents = <EID extends string, LID extends string, E extends TimelineEvent<EID, LID>>(
  events: ReadonlyArray<E>,
  domain: Domain,
  zoomScale: ZoomScale,
  groupByLane: boolean,
  cluster: boolean,
  onEventHover: (eventId: EID) => void,
  onEventUnhover: (eventId: EID) => void
): {
  eventsInsideDomain: ReadonlyArray<E>
  eventClustersInsideDomain: ReadonlyArray<TimelineEventCluster<LID>>
  isNoEventSelected: boolean
  isMouseOverEvent: boolean
  onEventHoverDecorated: (eventId: EID) => void
  onEventUnhoverDecorated: (eventId: EID) => void
} => {
  const [isMouseOverEvent, setIsMouseOverEvent] = useState(false)

  const onEventHoverDecorated = useCallback(
    (eventId: EID) => {
      setIsMouseOverEvent(true)
      onEventHover(eventId)
    },
    [setIsMouseOverEvent, onEventHover]
  )

  const onEventUnhoverDecorated = useCallback(
    (eventId: EID) => {
      setIsMouseOverEvent(false)
      onEventUnhover(eventId)
    },
    [setIsMouseOverEvent, onEventUnhover]
  )

  const [eventsInsideDomain, eventClustersInsideDomain, isNoEventSelected] = useMemo(() => {
    const eventsInsideDomain = events.filter((e) => {
      const isStartInView = e.startTimeMillis >= domain[0] && e.startTimeMillis <= domain[1]
      const isEndInView = e.endTimeMillis && e.endTimeMillis >= domain[0] && e.endTimeMillis <= domain[1]
      const isSpanningAcrossView = e.endTimeMillis && e.startTimeMillis < domain[0] && e.endTimeMillis > domain[1]
      return isStartInView || isEndInView || isSpanningAcrossView
    })

    const isNoEventSelected = eventsInsideDomain.some((e) => e.isSelected) === false

    // zoomScale 'minimum' is never reached
    if (!cluster || zoomScale === ZoomLevels.ONE_DAY) {
      return [eventsInsideDomain, [], isNoEventSelected]
    } else {
      return groups(eventsInsideDomain, (e) =>
        e.isPinned || e.isSelected
          ? pinnedOrSelectedGroup
          : `${groupByLane ? `${e.laneId}-` : ''}${format(e.startTimeMillis, clusterWidth(zoomScale))}${
              e.endTimeMillis ? `-${format(e.endTimeMillis, clusterWidth(zoomScale))}` : ''
            }`
      ).reduce(
        (
          acc: [ReadonlyArray<E>, ReadonlyArray<TimelineEventCluster<LID>>, boolean],
          eventGroup
        ): [ReadonlyArray<E>, ReadonlyArray<TimelineEventCluster<LID>>, boolean] => {
          if (eventGroup[0] === pinnedOrSelectedGroup || eventGroup[1].length <= 1) {
            return [[...acc[0], ...eventGroup[1]], [...acc[1]], isNoEventSelected]
          } else {
            return [
              [...acc[0]],
              [
                ...acc[1],
                {
                  timeMillis:
                    eventGroup[1].reduce(
                      (sum, event): number =>
                        sum + (event.startTimeMillis + (event.endTimeMillis ?? event.startTimeMillis)) / 2,
                      0
                    ) / eventGroup[1].length,
                  laneId: eventGroup[1][0].laneId,
                  size: eventGroup[1].length,
                  // color: eventGroup[1][0].color,
                },
              ],
              isNoEventSelected,
            ]
          }
        },
        [[], [], isNoEventSelected] as [ReadonlyArray<E>, ReadonlyArray<TimelineEventCluster<LID>>, boolean]
      )
    }
  }, [events, domain, zoomScale, groupByLane, cluster])

  return {
    eventsInsideDomain,
    eventClustersInsideDomain,
    isNoEventSelected,
    isMouseOverEvent,
    onEventHoverDecorated,
    onEventUnhoverDecorated,
  }
}
