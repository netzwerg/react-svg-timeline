import { timeFormat } from 'd3-time-format'
import 'react-app-polyfill/ie11'
import * as React from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { Timeline } from '../../dist'
import { List as ImmutableList } from 'immutable'
import { TimelineEvent, TimelineLane } from '../../src'
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
    const events = rawEvents.map((e: TimelineEvent) => ({ ...e, tooltip: eventTooltip(e) }))

    return (
        <div className={classes.root}>
            <Timeline events={events} lanes={lanes} dateFormat={dateFormat} />
        </div>
    )
}
