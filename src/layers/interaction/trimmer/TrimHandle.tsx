import { makeStyles } from '@material-ui/core'
import React from 'react'
import { CursorLabel } from '../CursorLabel'
import { useTimelineTheme } from '../../../theme'
import { TrimmerTheme } from '../../../theme/model'

const useStyles = makeStyles(() => ({
  cursor: (trimmerTheme: TrimmerTheme) => ({
    stroke: trimmerTheme.trimHandleColor,
    strokeWidth: trimmerTheme.trimHandleWidth,
  }),
}))

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
  const classes = useStyles(trimmerTheme)
  return (
    <>
      <line
        pointerEvents={'visibleStroke'}
        className={classes.cursor}
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
        className={classes.cursor}
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
