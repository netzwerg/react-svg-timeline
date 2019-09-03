import { timeFormat } from 'd3-time-format'
import 'react-app-polyfill/ie11'
import * as React from 'react'
import { useState } from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { Timeline } from '../../dist'
import { List as ImmutableList, Set as ImmutableSet } from 'immutable'
import { TimelineEvent, TimelineEventId, TimelineLane } from '../../src'
// @ts-ignore – IntelliJ doesn't believe that parcel can import JSON (https://parceljs.org/json.html)
import data from './data.json'
import { Typography } from '@material-ui/core'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'

const useStyles = makeStyles({
    root: {
        display: 'grid',
        width: 'calc(100vw - 200px)',
        gridTemplateRows: 'auto auto 300px',
        gridRowGap: 20,
        margin: 100
    },
    hci: {
        lineHeight: 0.8,
        '& td': {
            paddingRight: 10
        }
    }
})

const dateFormat = (ms: number) => timeFormat('%d.%m.%Y')(new Date(ms))

const eventTooltip = (e: TimelineEvent) =>
    e.endTimeMillis
        ? `${dateFormat(e.startTimeMillis)} - ${dateFormat(e.endTimeMillis)}`
        : dateFormat(e.startTimeMillis)

export const App = () => {
    const classes = useStyles()

    const lanes: ImmutableList<TimelineLane> = ImmutableList(data.lanes)
    const rawEvents: ImmutableList<TimelineEvent> = ImmutableList(data.events)

    const [selectedEvents, setSelectedEvents] = useState<ImmutableSet<TimelineEventId>>(ImmutableSet())
    const [pinnedEvents, setPinnedEvents] = useState<ImmutableSet<TimelineEventId>>(ImmutableSet())
    const events = rawEvents.map((e: TimelineEvent) => ({
        ...e,
        tooltip: eventTooltip(e),
        isSelected: selectedEvents.contains(e.eventId),
        isPinned: pinnedEvents.contains(e.eventId)
    }))

    const onEventHover = (e: TimelineEventId) => setSelectedEvents(prevSelectedEvents => prevSelectedEvents.add(e))
    const onEventUnhover = (e: TimelineEventId) => setSelectedEvents(prevSelectedEvents => prevSelectedEvents.remove(e))
    const onEventClick = (e: TimelineEventId) =>
        setPinnedEvents(prevPinnedEvents =>
            prevPinnedEvents.contains(e) ? prevPinnedEvents.remove(e) : prevPinnedEvents.add(e)
        )

    return (
        <div className={classes.root}>
            <Typography variant={'h2'}>react-svg-timeline</Typography>
            <KeyboardShortcuts />
            <AutoSizer>
                {({ width, height }: Size) => (
                    <Timeline
                        width={width}
                        height={height}
                        events={events}
                        lanes={lanes}
                        dateFormat={dateFormat}
                        onEventHover={onEventHover}
                        onEventUnhover={onEventUnhover}
                        onEventClick={onEventClick}
                    />
                )}
            </AutoSizer>
        </div>
    )
}

const KeyboardShortcuts = () => {
    const classes = useStyles()
    return (
        <Typography className={classes.hci} component={'div'}>
            <table>
                <tbody>
                    <tr>
                        <td>Zoom In:</td>
                        <td>Click</td>
                    </tr>
                    <tr>
                        <td>Zoom Out:</td>
                        <td>Alt + Click</td>
                    </tr>
                    <tr>
                        <td>Zoom Custom:</td>
                        <td>Shift + Click + Drag</td>
                    </tr>
                    <tr>
                        <td>Pan:</td>
                        <td>Click + Drag</td>
                    </tr>
                    <tr>
                        <td>Reset:</td>
                        <td>Esc</td>
                    </tr>
                </tbody>
            </table>
        </Typography>
    )
}
