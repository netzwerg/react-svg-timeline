import React, { CSSProperties } from 'react'
import { useTimelineTheme } from '../../theme'

const useTextStyle = (fill?: string): CSSProperties => {
  const theme = useTimelineTheme()
  return {
    fill: fill ?? theme.mouseCursor.labelColor,
    textAnchor: 'middle',
    dominantBaseline: 'middle',
    fontFamily: theme.base.fontFamilyCaption,
    cursor: 'default',
  }
}

interface Props {
  x: number
  overline: string
  label: string
  y: number | string
  cursor: string
  fill?: string
}

export const CursorLabel = ({ x, y, overline, label, cursor, fill }: Props) => {
  const style = useTextStyle(fill)
  return (
    <text style={style} x={x} y={y} cursor={cursor}>
      <tspan x={x} cursor={cursor}>
        {overline}
      </tspan>
      <tspan x={x} dy={18} cursor={cursor}>
        {label}
      </tspan>
    </text>
  )
}
