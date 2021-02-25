import { makeStyles } from '@material-ui/core'
import { orange } from '@material-ui/core/colors'
import React from 'react'
import CursorLabel from '../CursorLabel'

const useStyles = makeStyles(() => ({
  cursor: {
    stroke: orange.A200,
    strokeWidth: 10,
  },
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
  const classes = useStyles()
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
      <CursorLabel x={x} y={'11%'} cursor="default" overline={label} label={dateString} />
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
