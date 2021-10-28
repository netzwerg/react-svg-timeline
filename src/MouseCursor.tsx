import * as React from 'react'
import { ZoomScale } from './ZoomScale'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { orange } from '@material-ui/core/colors'
import type { Theme } from '@material-ui/core'
import { Cursor } from './model'
import { InteractionMode } from './InteractionHandling'
import CursorLabel from './CursorLabel'

const useStyles = makeStyles<Theme, { color: string }>(() => ({
  cursor: {
    stroke: ({ color }) => color,
    strokeWidth: 2,
  },
  zoomRange: {
    fill: ({ color }) => color,
    opacity: 0.1,
  },
}))

interface Props {
  mousePosition: number
  cursorLabel: string
  cursor: Cursor
  cursorColor?: string
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
  cursorColor,
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
          return <PanningCursor mousePosition={mousePosition} cursorColor={cursorColor} />
        case 'rubber band': {
          const [start, end] =
            interactionMode.variant === 'anchored'
              ? [interactionMode.anchorX, undefined]
              : [interactionMode.anchorX, interactionMode.currentX]
          return <RubberBandCursor start={start} end={end} cursorColor={cursorColor} />
        }
        default:
          return (
            <ZoomCursor
              mousePosition={mousePosition}
              cursor={cursor}
              cursorLabel={cursorLabel}
              cursorColor={cursorColor}
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
  cursorColor?: string
  zoomScale: ZoomScale
  isZoomInPossible: boolean
  zoomRangeStart: number
  zoomRangeEnd: number
}

const ZoomCursor = ({
  mousePosition,
  cursor,
  cursorLabel,
  cursorColor,
  zoomScale,
  isZoomInPossible,
  zoomRangeStart,
  zoomRangeEnd,
}: ZoomCursorProps) => {
  const classes = useStyles({ color: cursorColor || orange.A200 })
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
        fill={cursorColor}
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
  cursorColor?: string
}

const PanningCursor = ({ mousePosition, cursorColor }: PanningProps) => {
  const classes = useStyles({ color: cursorColor || orange.A200 })
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
  cursorColor?: string
}

const RubberBandCursor = ({ start, end, cursorColor }: RubberBandProps) => {
  const classes = useStyles({ color: cursorColor || orange.A200 })
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
