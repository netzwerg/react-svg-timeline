import * as React from 'react'
import { Marks } from './Marks'
import { List as ImmutableList } from 'immutable'
import { scaleBand, ScaleLinear } from 'd3-scale'
import { Theme } from '@material-ui/core'
import { Event, EventId, Lane } from './model'
import { Axis } from './Axis'
import { defaultLaneColor } from './shared'
import makeStyles from '@material-ui/core/styles/makeStyles'

const useStyles = makeStyles((theme: Theme) => ({
    conceptLabel: {
        fontFamily: theme.typography.fontFamily,
        fontWeight: 600,
        opacity: 0.4
    }
}))

type Props = Readonly<{
    mouseCursor: React.ReactNode
    height: number
    events: ImmutableList<Event>
    timeScale: ScaleLinear<number, number>
    eventMarkerHeight?: number
    lanes: ImmutableList<Lane>
    onEventHover?: (eventId: EventId) => void
    onEventUnhover?: (eventId: EventId) => void
    onEventClick?: (eventId: EventId) => void
}>

export const ExpandedMarks = ({
    mouseCursor,
    height,
    events,
    lanes,
    timeScale,
    onEventHover,
    onEventUnhover,
    onEventClick
}: Props) => {
    const classes = useStyles()

    const yScale = scaleBand()
        .domain(lanes.map(l => l.laneId).toArray())
        .range([0, 0.9 * height])
        .paddingInner(0.1)
        .paddingOuter(0.8)

    const fontSize = 0.8 * yScale.bandwidth()

    const axes = lanes
        .map((lane: Lane) => {
            const labelXOffset = 10
            const labelYOffset = -0.1 * yScale.bandwidth()
            const y = yScale(lane.laneId)!
            return (
                <g key={`axis-${lane.laneId}`}>
                    <Axis y={y} />
                    <text
                        className={classes.conceptLabel}
                        fontSize={fontSize}
                        x={labelXOffset}
                        y={y + labelYOffset}
                        fill={lane.color || defaultLaneColor}
                    >
                        {lane.label}
                    </text>
                </g>
            )
        })
        .valueSeq()

    const marks = lanes
        .map((lane: Lane) => {
            const laneSpecificEvents = events.filter(e => e.laneId === lane.laneId).toList()
            return (
                <g key={`marks-${lane.laneId}`}>
                    <Marks
                        events={laneSpecificEvents}
                        timeScale={timeScale}
                        y={yScale(lane.laneId)!}
                        onEventHover={onEventHover}
                        onEventUnhover={onEventUnhover}
                        onEventClick={onEventClick}
                    />
                </g>
            )
        })
        .valueSeq()

    return (
        <g>
            {axes}
            {mouseCursor}
            {marks}
        </g>
    )
}
