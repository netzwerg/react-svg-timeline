import React, { CSSProperties } from 'react'
import { ScaleLinear } from 'd3-scale'
import TrimHandle from './TrimHandle'
import Triangle, { TriangleDirection } from '../../../shared/Triangle'
import { useTimelineTheme } from '../../../theme/useTimelineTheme'
import { TrimHover, TrimNone } from '../model'

const useAreaStyle = (): CSSProperties => {
  const theme = useTimelineTheme().trimmer
  return {
    fill: theme.trimRangeInsideColor,
    opacity: theme.trimRangeInsideOpacity,
  }
}

const useAreaHighlightStyle = (): CSSProperties => {
  const theme = useTimelineTheme().trimmer
  return {
    fill: theme.trimRangeInsideHighlightColor,
    opacity: theme.trimRangeInsideHighlightOpacity,
  }
}

const useTriangleStyle = (): CSSProperties => {
  const theme = useTimelineTheme().trimmer
  return {
    fill: theme.trimTriangleColor,
  }
}

interface Props {
  startX: number
  endX: number
  height: number
  width: number
  timeScale: ScaleLinear<number, number>
  highlightActiveArea: boolean
  setTrimMode: (trimHoverMode: TrimHover | TrimNone) => void
  dateFormat: (ms: number) => string
}

export function Trimmer({
  startX,
  endX,
  timeScale,
  height,
  width,
  highlightActiveArea,
  setTrimMode,
  dateFormat,
}: Props) {
  const areaStyle = useAreaStyle()
  const areaHighlightStyle = useAreaHighlightStyle()
  const triangleStyle = useTriangleStyle()

  const [y1, y2] = [0, height]
  const [scaledStartX, scaledEndX] = [timeScale(startX)!, timeScale(endX)!]

  return (
    <g>
      <rect
        style={highlightActiveArea ? areaHighlightStyle : areaStyle}
        x={Math.min(scaledStartX, scaledEndX)}
        y={y1}
        width={Math.abs(scaledEndX - scaledStartX)}
        height={y2}
      />
      {scaledStartX > 0 ? (
        <TrimHandle
          x={scaledStartX}
          dateString={dateFormat(startX)}
          label="Date from"
          height={height}
          onMouseEnter={() => setTrimMode({ variant: 'trim hover start' })}
          onMouseLeave={() => setTrimMode({ variant: 'none' })}
        />
      ) : (
        <Triangle style={triangleStyle} x={25} y={height / 2} dimension={50} direction={TriangleDirection.Left} />
      )}
      {width - scaledEndX > 0 ? (
        <TrimHandle
          x={scaledEndX}
          dateString={dateFormat(endX)}
          label="Date to"
          height={height}
          onMouseEnter={() => setTrimMode({ variant: 'trim hover end' })}
          onMouseLeave={() => setTrimMode({ variant: 'none' })}
        />
      ) : (
        <Triangle
          style={triangleStyle}
          x={width - 25}
          y={height / 2}
          dimension={50}
          direction={TriangleDirection.Right}
        />
      )}
    </g>
  )
}
