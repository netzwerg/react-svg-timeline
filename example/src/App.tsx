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

const useStyles = makeStyles({
    root: {
        display: 'grid',
        width: '100vw',
        height: 'calc(100vh - 200px)',
        paddingTop: 100,
        paddingBottom: 100
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
    const events = rawEvents.map((e: TimelineEvent) => ({
        ...e,
        tooltip: eventTooltip(e),
        isSelected: selectedEvents.contains(e.eventId)
    }))

    const onEventHover = (e: TimelineEventId) => setSelectedEvents(prevSelectedEvents => prevSelectedEvents.add(e))
    const onEventUnhover = (e: TimelineEventId) => setSelectedEvents(prevSelectedEvents => prevSelectedEvents.remove(e))

    return (
        <div className={classes.root}>
            <Timeline
                events={events}
                lanes={lanes}
                dateFormat={dateFormat}
                onEventHover={onEventHover}
                onEventUnhover={onEventUnhover}
            />
        </div>
    )
}
