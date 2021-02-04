import * as React from 'react'
import { ZoomScale } from './ZoomScale'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { orange } from '@material-ui/core/colors'
import { Cursor } from './model'
import { InteractionMode } from './InteractionHandling'
import CursorLabel from './CursorLabel'

const useStyles = makeStyles(() => ({
  cursor: {
    stroke: orange.A200,
    strokeWidth: 2,
  },
  zoomRange: {
    fill: orange.A200,
    opacity: 0.1,
  },
}))

interface Props {
  mousePosition: number
  cursorLabel: string
  cursor: Cursor
  interactionMode: InteractionMode
  zoomRangeStart: number
  zoomRangeEnd: number
  zoomScale: ZoomScale
  isZoomInPossible: boolean
}

export const MouseCursor = ({
  mousePosition,
  cursorLabel,
  cursor,
  interactionMode,
  zoomRangeStart,
  zoomRangeEnd,
  zoomScale,
  isZoomInPossible,
}: Props) => {
  if (isNaN(mousePosition)) {
    return <g />
  } else {
    const cursorComponent = () => {
      switch (interactionMode.type) {
        case 'animation in progress': {
          return <g />
        }
        case 'panning':
          return <PanningCursor mousePosition={mousePosition} />
        case 'rubber band': {
          const [start, end] =
            interactionMode.variant === 'anchored'
              ? [interactionMode.anchorX, undefined]
              : [interactionMode.anchorX, interactionMode.currentX]
          return <RubberBandCursor start={start} end={end} />
        }
        default:
          return (
            <ZoomCursor
              mousePosition={mousePosition}
              cursor={cursor}
              cursorLabel={cursorLabel}
              zoomScale={zoomScale}
              isZoomInPossible={isZoomInPossible}
              zoomRangeStart={zoomRangeStart}
              zoomRangeEnd={zoomRangeEnd}
            />
          )
      }
    }

    return (
      <g>
        {/* covering complete area prevents flickering cursor and asserts that mouse events are caught */}
        <rect x={0} y={0} width={'100%'} height={'100%'} fill={'transparent'} />
        {cursorComponent()}
      </g>
    )
  }
}

/* ·················································································································· */
/*  Zoom
/* ·················································································································· */

interface ZoomCursorProps {
  mousePosition: number
  cursor: Cursor
  cursorLabel: string
  zoomScale: ZoomScale
  isZoomInPossible: boolean
  zoomRangeStart: number
  zoomRangeEnd: number
}

const ZoomCursor = ({
  mousePosition,
  cursor,
  cursorLabel,
  zoomScale,
  isZoomInPossible,
  zoomRangeStart,
  zoomRangeEnd,
}: ZoomCursorProps) => {
  const classes = useStyles()
  return (
    <g>
      <rect
        visibility={isZoomInPossible ? 'visible' : 'hidden'}
        className={classes.zoomRange}
        x={zoomRangeStart}
        y={0}
        width={zoomRangeEnd - zoomRangeStart}
        height="100%"
        cursor={cursor}
      />
      <line className={classes.cursor} x1={mousePosition} y1="0%" x2={mousePosition} y2="5%" cursor={cursor} />
      <CursorLabel
        x={mousePosition}
        y={isZoomInPossible ? '11%' : '15%'}
        cursor={cursor}
        overline={cursorLabel}
        label={isZoomInPossible ? zoomScale : ''}
      />
      <line className={classes.cursor} x1={mousePosition} y1="23%" x2={mousePosition} y2="100%" cursor={cursor} />
    </g>
  )
}

/* ·················································································································· */
/*  Panning
/* ·················································································································· */

interface PanningProps {
  mousePosition: number
}

const PanningCursor = ({ mousePosition }: PanningProps) => {
  const classes = useStyles()
  return (
    <g>
      <line className={classes.cursor} x1={mousePosition} y1={'0%'} x2={mousePosition} y2={'100%'} cursor={'grab'} />
    </g>
  )
}

/* ·················································································································· */
/*  RubberBand
/* ·················································································································· */

interface RubberBandProps {
  start: number
  end?: number
}

const RubberBandCursor = ({ start, end }: RubberBandProps) => {
  const classes = useStyles()
  const [y1, y2] = ['0%', '100%']
  return (
    <g>
      <line className={classes.cursor} x1={start} y1={y1} x2={start} y2={y2} />
      {end && (
        <g>
          <line className={classes.cursor} x1={end} y1={y1} x2={end} y2={y2} />
          <rect
            className={classes.zoomRange}
            x={Math.min(start, end)}
            y={y1}
            width={Math.abs(end - start)}
            height={y2}
          />
        </g>
      )}
    </g>
  )
}
