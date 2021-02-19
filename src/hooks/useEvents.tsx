import { useMemo } from 'react'
import { groups } from 'd3-array'
import { format } from 'date-fns'
import { Domain, TimelineEvent, TimelineEventCluster } from '../model'
import { ZoomScale } from '../ZoomScale'

function clusterWidth(scale: ZoomScale): string {
  switch (scale) {
    case 'maximum':
      return 'yyyy'
    case '10 years':
      return 'yyyy-MM'
    case '1 year':
      return 'yyyy-MM-ww'
    case '1 month':
      return 'yyyy-MM-ww-dd'
    case '1 week':
      return 'yyyy-MM-ww-dd-aaa'
    case '1 day':
      return 'yyyy-MM-ww-dd-HH'
    case 'minimum':
      return 'T'
    default:
      return 'T'
  }
}

// TODO: Don't cluster events with start- AND endTimeMillis if the timespan is larger than the next smaller zoom scale (otherwise there is a possibility, that the event is never fully visible)
// TODO: Toggling between expand/collapse changes cluster sizes; Clusters are displayed proportional within each lane - this could be desired or not -> decide.

export function useEvents<EID extends string, LID extends string>(
  events: ReadonlyArray<TimelineEvent<EID, LID>>,
  domain: Domain,
  zoomScale: ZoomScale,
  groupByLane: boolean,
  cluster: boolean
): [ReadonlyArray<TimelineEvent<EID, LID>>, ReadonlyArray<TimelineEventCluster<LID>>] {
  const comparableEvents = JSON.stringify(events)

  return useMemo(() => {
    const eventsInsideDomain = events.filter((e) => {
      const isStartInView = e.startTimeMillis >= domain[0] && e.startTimeMillis <= domain[1]
      const isEndInView = e.endTimeMillis && e.endTimeMillis >= domain[0] && e.endTimeMillis <= domain[1]
      const isSpanningAcrossView = e.endTimeMillis && e.startTimeMillis < domain[0] && e.endTimeMillis > domain[1]
      return isStartInView || isEndInView || isSpanningAcrossView
    })

    // zoomScale 'minimum' is never reached
    if (!cluster || zoomScale === '1 day') {
      return [eventsInsideDomain, []]
    } else {
      return groups(
        eventsInsideDomain,
        (e) =>
          `${groupByLane ? `${e.laneId}-` : ''}${format(e.startTimeMillis, clusterWidth(zoomScale))}${
            e.endTimeMillis ? `-${format(e.endTimeMillis, clusterWidth(zoomScale))}` : ''
          }`
      ).reduce(
        (
          acc: [ReadonlyArray<TimelineEvent<EID, LID>>, ReadonlyArray<TimelineEventCluster<LID>>],
          eventGroup
        ): [ReadonlyArray<TimelineEvent<EID, LID>>, ReadonlyArray<TimelineEventCluster<LID>>] => {
          if (eventGroup[1].length > 1) {
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
                  color: eventGroup[1][0].color,
                },
              ],
            ]
          } else {
            return [[...acc[0], eventGroup[1][0]], [...acc[1]]]
          }
        },
        [[], []] as [ReadonlyArray<TimelineEvent<EID, LID>>, ReadonlyArray<TimelineEventCluster<LID>>]
      )
    }
  }, [comparableEvents, domain, zoomScale, groupByLane, cluster])
}
