import { timeFormat } from 'd3-time-format'
import 'react-app-polyfill/ie11'
import * as React from 'react'
import { FunctionComponent, useState, useCallback } from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { Timeline } from '../../dist'
import { Set as ImmutableSet } from 'immutable'
// @ts-ignore – IntelliJ doesn't believe that parcel can import JSON (https://parceljs.org/json.html)
import data from './data.json'
import { Typography } from '@material-ui/core'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import { CustomizedTimeline } from './CustomizedTimeline'
import { ExampleEvent, ExampleLane, ExampleProps, TimelineEventId, TimelineLaneId } from './types'
import Switch from '@material-ui/core/Switch'
import { LaneDisplayMode, TimelineProps } from '../../src'
import Card from '@material-ui/core/Card'

const useStyles = makeStyles({
  root: {
    display: 'grid',
    width: 'calc(100vw - 200px)',
    gridTemplateRows: 'auto auto 300px 300px',
    gridRowGap: 100,
    margin: 100,
  },
  controlPanel: {
    display: 'grid',
    width: '100%',
    gridTemplateColumns: '50% 50%',
    gridGap: 5,
  },
  card: {
    padding: 15,
  },
  hci: {
    color: '#9e9e9e',
    lineHeight: 0.8,
    '& td': {
      paddingRight: 10,
    },
  },
  configToggles: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    alignItems: 'center',
  },
})

const dateFormat = (ms: number) => timeFormat('%d.%m.%Y')(new Date(ms))
const lanes: ReadonlyArray<ExampleLane> = data.lanes
const rawEvents: ReadonlyArray<ExampleEvent> = data.events

const eventTooltip = (e: ExampleEvent) =>
  e.endTimeMillis ? `${dateFormat(e.startTimeMillis)} - ${dateFormat(e.endTimeMillis)}` : dateFormat(e.startTimeMillis)

export const App = () => {
  const classes = useStyles()
  const [laneDisplayMode, setLaneDisplayMode] = useState<LaneDisplayMode>('expanded')
  const [suppressMarkAnimation, setSuppressMarkAnimation] = useState<boolean>(false)
  return (
    <div className={classes.root}>
      <Typography variant={'h2'}>react-svg-timeline</Typography>
      <ConfigPanel
        laneDisplayMode={laneDisplayMode}
        setLaneDisplayMode={setLaneDisplayMode}
        suppressMarkAnimation={suppressMarkAnimation}
        setSuppressMarkAnimation={setSuppressMarkAnimation}
      />
      <DemoTimeline
        timelineComponent={Timeline}
        title={'Default'}
        rawEvents={rawEvents}
        laneDisplayMode={laneDisplayMode}
        suppressMarkAnimation={suppressMarkAnimation}
      />
      <DemoTimeline
        timelineComponent={CustomizedTimeline}
        title={'Custom Event Marks'}
        rawEvents={rawEvents}
        laneDisplayMode={laneDisplayMode}
        suppressMarkAnimation={suppressMarkAnimation}
      />
    </div>
  )
}

interface DemoTimelineProps {
  title: string
  rawEvents: ReadonlyArray<ExampleEvent>
  timelineComponent: FunctionComponent<ExampleProps>
  laneDisplayMode: LaneDisplayMode
  suppressMarkAnimation: boolean
}

const DemoTimeline = ({
  title,
  rawEvents,
  timelineComponent,
  laneDisplayMode,
  suppressMarkAnimation,
}: DemoTimelineProps) => {
  const [selectedEvents, setSelectedEvents] = useState<ImmutableSet<TimelineEventId>>(ImmutableSet())
  const [pinnedEvents, setPinnedEvents] = useState<ImmutableSet<TimelineEventId>>(ImmutableSet())
  const [zoomRange, setZoomRange] = useState<[number, number]>()
  const [cursorZoomRange, setCursorZoomRange] = useState<[number, number]>()
  const events = rawEvents.map((e: ExampleEvent) => ({
    ...e,
    tooltip: eventTooltip(e),
    isSelected: selectedEvents.contains(e.eventId),
    isPinned: pinnedEvents.contains(e.eventId),
  }))

  const onEventHover = (e: TimelineEventId) => setSelectedEvents((prevSelectedEvents) => prevSelectedEvents.add(e))
  const onEventUnhover = (e: TimelineEventId) => setSelectedEvents((prevSelectedEvents) => prevSelectedEvents.remove(e))
  const onEventClick = (e: TimelineEventId) =>
    setPinnedEvents((prevPinnedEvents) =>
      prevPinnedEvents.contains(e) ? prevPinnedEvents.remove(e) : prevPinnedEvents.add(e)
    )
  const onZoomRangeChange = useCallback(
    (startMillis: number, endMillis: number) => setZoomRange([startMillis, endMillis]),
    [setZoomRange]
  )
  const onZoomRangeMove = useCallback(
    (startMillis: number, endMillis: number) => setCursorZoomRange([startMillis, endMillis]),
    [setCursorZoomRange]
  )

  return (
    <div>
      <Typography variant="h6">{title}</Typography>
      {zoomRange && (
        <Typography variant="caption" display="block">
          <strong>Zoom Range:</strong> {new Date(zoomRange[0]).toLocaleString()} -{' '}
          {new Date(zoomRange[1]).toLocaleString()}
        </Typography>
      )}
      {cursorZoomRange && (
        <Typography variant="caption">
          <strong>Zoom Range at Cursor:</strong> {new Date(cursorZoomRange[0]).toLocaleString()} -{' '}
          {new Date(cursorZoomRange[1]).toLocaleString()}
        </Typography>
      )}
      <AutoSizer>
        {({ width, height }: Size) => {
          const timelineProps: TimelineProps<TimelineEventId, TimelineLaneId> = {
            width,
            height,
            dateFormat,
            lanes,
            events,
            laneDisplayMode,
            suppressMarkAnimation,
            onEventHover,
            onEventUnhover,
            onEventClick,
            onZoomRangeChange,
            onZoomRangeMove,
          }
          return React.createElement(timelineComponent, timelineProps)
        }}
      </AutoSizer>
    </div>
  )
}

interface ConfigProps {
  laneDisplayMode: LaneDisplayMode
  setLaneDisplayMode: (laneDisplayMode: LaneDisplayMode) => void
  suppressMarkAnimation: boolean
  setSuppressMarkAnimation: (suppressMarkAnimation: boolean) => void
}

const ConfigPanel = (props: ConfigProps) => {
  const classes = useStyles()
  return (
    <div className={classes.controlPanel}>
      <Card className={classes.card}>
        <KeyboardShortcuts />
      </Card>
      <Card className={classes.card}>
        <ConfigOptions {...props} />
      </Card>
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

const ConfigOptions = ({
  laneDisplayMode,
  setLaneDisplayMode,
  suppressMarkAnimation,
  setSuppressMarkAnimation,
}: ConfigProps) => {
  const classes = useStyles()

  const laneDisplayModeChecked = laneDisplayMode === 'collapsed'
  const onLaneDisplayModeChange = () => setLaneDisplayMode(laneDisplayModeChecked ? 'expanded' : 'collapsed')

  const onSuppressMarkAnimationChange = () => setSuppressMarkAnimation(!suppressMarkAnimation)

  return (
    <div className={classes.configToggles}>
      <Typography>Collapse Lanes</Typography>
      <Switch checked={laneDisplayModeChecked} onChange={onLaneDisplayModeChange} />
      <Typography>Animate Marks</Typography>
      <Switch checked={!suppressMarkAnimation} onChange={onSuppressMarkAnimationChange} />
    </div>
  )
}
