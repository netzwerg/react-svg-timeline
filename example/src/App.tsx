import { timeFormat } from 'd3-time-format'
import 'react-app-polyfill/ie11'
import * as React from 'react'
import { FunctionComponent, useState } from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { Timeline } from '../../dist'
import { Set as ImmutableSet } from 'immutable'
import { Typography } from '@material-ui/core'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import { ExampleEvent, ExampleLane, ExampleProps, TimelineEventId, TimelineLaneId } from './types'
import Switch from '@material-ui/core/Switch'
import { LaneDisplayMode } from '../../src'
import Card from '@material-ui/core/Card'

const useStyles = makeStyles({
  root: {
    display: 'grid',
    width: 'calc(100vw - 200px)',
    gridTemplateRows: 'auto auto 300px 300px',
    gridRowGap: 40,
    margin: 100
  },
  controlPanel: {
    display: 'grid',
    width: '100%',
    gridTemplateColumns: '50% 50%',
    gridGap: 5
  },
  card: {
    padding: 15
  },
  hci: {
    color: '#9e9e9e',
    lineHeight: 0.8,
    '& td': {
      paddingRight: 10
    }
  },
  toggleSwitch: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    alignItems: 'center'
  }
})

const dateFormat = (ms: number) => timeFormat('%d.%m.%Y')(new Date(ms))

const laneId = 'example-lane-id' as TimelineLaneId
const lanes: ReadonlyArray<ExampleLane> = [{ laneId, label: 'Example' }]
const rawEvents: ReadonlyArray<ExampleEvent> = Array.from(Array(1000).keys()).map<ExampleEvent>(i => ({
  eventId: `event-${i}` as TimelineEventId,
  laneId,
  startTimeMillis: Math.random() * Date.now()
}))

const eventTooltip = (e: ExampleEvent) =>
  e.endTimeMillis ? `${dateFormat(e.startTimeMillis)} - ${dateFormat(e.endTimeMillis)}` : dateFormat(e.startTimeMillis)

export const App = () => {
  const classes = useStyles()
  const [laneDisplayMode, setLaneDisplayMode] = useState<LaneDisplayMode>('collapsed')
  return (
    <div className={classes.root}>
      <Typography variant={'h2'}>react-svg-timeline</Typography>
      <ControlPanel laneDisplayMode={laneDisplayMode} setLaneDisplayMode={setLaneDisplayMode} />
      <DemoTimeline
        timelineComponent={Timeline}
        title={'Default'}
        rawEvents={rawEvents}
        laneDisplayMode={laneDisplayMode}
      />
    </div>
  )
}

interface DemoTimelineProps {
  title: string
  rawEvents: ReadonlyArray<ExampleEvent>
  timelineComponent: FunctionComponent<ExampleProps>
  laneDisplayMode: LaneDisplayMode
}

const DemoTimeline = ({ title, rawEvents, timelineComponent, laneDisplayMode }: DemoTimelineProps) => {
  // noinspection JSUnusedLocalSymbols
  const [selectedEvents, setSelectedEvents] = useState<ImmutableSet<TimelineEventId>>(ImmutableSet())
  const [pinnedEvents, setPinnedEvents] = useState<ImmutableSet<TimelineEventId>>(ImmutableSet())
  const events = rawEvents.map((e: ExampleEvent) => ({
    ...e,
    tooltip: eventTooltip(e),
    isSelected: false, // selectedEvents.contains(e.eventId),
    isPinned: pinnedEvents.contains(e.eventId)
  }))

  const onEventHover = (e: TimelineEventId) => setSelectedEvents(prevSelectedEvents => prevSelectedEvents.add(e))
  const onEventUnhover = (e: TimelineEventId) => setSelectedEvents(prevSelectedEvents => prevSelectedEvents.remove(e))
  const onEventClick = (e: TimelineEventId) =>
    setPinnedEvents(prevPinnedEvents =>
      prevPinnedEvents.contains(e) ? prevPinnedEvents.remove(e) : prevPinnedEvents.add(e)
    )

  return (
    <div>
      <Typography variant={'caption'}>{title}</Typography>
      <AutoSizer>
        {({ width, height }: Size) => {
          const timelineProps = {
            width,
            height,
            dateFormat,
            lanes,
            events,
            laneDisplayMode,
            onEventHover,
            onEventUnhover,
            onEventClick
          }
          return React.createElement(timelineComponent, timelineProps)
        }}
      </AutoSizer>
    </div>
  )
}

interface LaneDisplayModeProps {
  laneDisplayMode: LaneDisplayMode
  setLaneDisplayMode: (laneDisplayMode: LaneDisplayMode) => void
}

const ControlPanel = ({ laneDisplayMode, setLaneDisplayMode }: LaneDisplayModeProps) => {
  const classes = useStyles()
  return (
    <div className={classes.controlPanel}>
      <Card className={classes.card}>
        <KeyboardShortcuts />
      </Card>
      <Card className={classes.card}>
        <ConfigOptions laneDisplayMode={laneDisplayMode} setLaneDisplayMode={setLaneDisplayMode} />
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

const ConfigOptions = ({ laneDisplayMode, setLaneDisplayMode }: LaneDisplayModeProps) => {
  const classes = useStyles()
  const checked = laneDisplayMode === 'collapsed'
  const onChange = () => setLaneDisplayMode(checked ? 'expanded' : 'collapsed')

  return (
    <div className={classes.toggleSwitch}>
      <Typography>Collapse Lanes</Typography>
      <Switch checked={checked} onChange={onChange} />
    </div>
  )
}
