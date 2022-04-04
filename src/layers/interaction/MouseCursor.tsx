import * as React from 'react'
import { ZoomScale } from '../../shared/ZoomScale'
import { Cursor } from '../../model'
import { InteractionMode } from '.'
import { CursorLabel } from './CursorLabel'
import { useTimelineTheme } from '../../theme'

const useCursorStyle = () => {
  const theme = useTimelineTheme().mouseCursor
  return {
    stroke: theme.lineColor,
    strokeWidth: theme.lineWidth,
  }
}

const useZoomRangeStyle = () => {
  const theme = useTimelineTheme().mouseCursor
  return {
    fill: theme.zoomRangeColor,
    opacity: theme.zoomRangeOpacity,
  }
}

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
  const cursorStyle = useCursorStyle()
  const zoomRangeStyle = useZoomRangeStyle()
  return (
    <g>
      <rect
        visibility={isZoomInPossible ? 'visible' : 'hidden'}
        style={zoomRangeStyle}
        x={zoomRangeStart}
        y={0}
        width={zoomRangeEnd - zoomRangeStart}
        height="100%"
        cursor={cursor}
      />
      <line style={cursorStyle} x1={mousePosition} y1="0%" x2={mousePosition} y2="5%" cursor={cursor} />
      <CursorLabel
        x={mousePosition}
        y={isZoomInPossible ? '11%' : '15%'}
        cursor={cursor}
        overline={cursorLabel}
        label={isZoomInPossible ? zoomScale : ''}
      />
      <line style={cursorStyle} x1={mousePosition} y1="23%" x2={mousePosition} y2="100%" cursor={cursor} />
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
  const cursorStyle = useCursorStyle()
  return (
    <g>
      <line style={cursorStyle} x1={mousePosition} y1={'0%'} x2={mousePosition} y2={'100%'} cursor={'grab'} />
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
  const cursorStyle = useCursorStyle()
  const zoomRangeStyle = useZoomRangeStyle()

  const [y1, y2] = ['0%', '100%']
  return (
    <g>
      <line style={cursorStyle} x1={start} y1={y1} x2={start} y2={y2} />
      {end && (
        <g>
          <line style={cursorStyle} x1={end} y1={y1} x2={end} y2={y2} />
          <rect style={zoomRangeStyle} x={Math.min(start, end)} y={y1} width={Math.abs(end - start)} height={y2} />
        </g>
      )}
    </g>
  )
}
