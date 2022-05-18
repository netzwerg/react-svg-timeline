import React, { CSSProperties } from 'react'
import { CursorLabel } from '../CursorLabel'
import { useTimelineTheme } from '../../../theme/useTimelineTheme'

const useTrimHandleStyle = (): CSSProperties => {
  const theme = useTimelineTheme().trimmer
  return {
    stroke: theme.trimHandleColor,
    strokeWidth: theme.trimHandleWidth,
  }
}

interface Props {
  x: number
  label: string
  dateString: string
  height: number
  onMouseEnter: () => void
  onMouseLeave: () => void
}

function TrimHandle({ x, label, dateString, height, onMouseEnter, onMouseLeave }: Props) {
  const trimmerTheme = useTimelineTheme().trimmer
  const lineStyle = useTrimHandleStyle()
  return (
    <>
      <line
        style={lineStyle}
        pointerEvents={'visibleStroke'}
        x1={x}
        y1={0}
        x2={x}
        y2="5%"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
      <CursorLabel
        x={x}
        y={'11%'}
        cursor="default"
        overline={label}
        label={dateString}
        fill={trimmerTheme.trimHandleLabelColor}
      />
      <line
        style={lineStyle}
        x1={x}
        y1="23%"
        x2={x}
        y2={height}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        pointerEvents={'visibleStroke'}
      />
    </>
  )
}

export default TrimHandle
