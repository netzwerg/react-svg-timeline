import React, { CSSProperties } from 'react'
import { useTimelineTheme } from '../../../theme/useTimelineTheme'

const useTrimRangeStyle = (): CSSProperties => {
  const theme = useTimelineTheme().trimmer
  return {
    fill: theme.trimRangeOutsideColor,
    opacity: theme.trimRangeOutsideOpacity,
  }
}

interface Props {
  startX: number
  endX: number
  height: number
  width: number
}

export function TrimRange({ startX, endX, height, width }: Props) {
  const trimRangeStyle = useTrimRangeStyle()
  const [y1, y2] = [0, height]
  return (
    <g>
      {startX > 0 && <rect style={trimRangeStyle} x={0} y={y1} width={startX} height={y2} />}
      {width - endX > 0 && <rect style={trimRangeStyle} x={endX} y={y1} width={width - endX} height={y2} />}
    </g>
  )
}
