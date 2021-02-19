import React from 'react'
import { scaleBand, ScaleLinear } from 'd3-scale'
import { Theme } from '@material-ui/core'
import { TimelineEventCluster, TimelineLane } from './model'
import { defaultClusterColor } from './shared'
import makeStyles from '@material-ui/core/styles/makeStyles'

const useStyles = makeStyles((theme: Theme) => ({
  clusterCircle: {
    stroke: theme.palette.background.paper,
    strokeWidth: 2,
    fillOpacity: 0.5,
  },
}))

interface Props<LID> {
  height: number
  eventClusters: ReadonlyArray<TimelineEventCluster<LID>>
  timeScale: ScaleLinear<number, number>
  eventClusterHeight?: number
  lanes: ReadonlyArray<TimelineLane<LID>>
  expanded: boolean
}

export const EventClusters = <LID extends string>({
  height,
  eventClusters,
  lanes,
  timeScale,
  eventClusterHeight = 20,
  expanded,
}: Props<LID>) => {
  const classes = useStyles()

  // TODO: This is duplicate to ExpandedMarkers --> Refactor!
  const yScale = scaleBand()
    .domain(lanes.map((l) => l.laneId))
    .range([0, height])
    .paddingInner(0.1)
    .paddingOuter(0.8)

  const clusterSizes = new Set(eventClusters.map((c) => c.size.toString()))
  const clusterScale = scaleBand()
    .domain(Array.from(clusterSizes))
    .range([eventClusterHeight, eventClusterHeight * 2])

  return (
    <g>
      {lanes.map((lane: TimelineLane<LID>) =>
        eventClusters
          .filter((c) => c.laneId === lane.laneId)
          .map((eventCluster) => (
            <g key={`eventCluster-${lane.laneId}-${eventCluster.timeMillis}`}>
              <circle
                cx={timeScale(eventCluster.timeMillis)}
                cy={expanded ? yScale(lane.laneId)! : height / 2}
                r={clusterScale(eventCluster.size.toString())!}
                className={classes.clusterCircle}
                fill={eventCluster.color || defaultClusterColor}
              />
            </g>
          ))
      )}
    </g>
  )
}
