import React from 'react'

export enum TriangleDirection {
  Up,
  Down,
  Left,
  Right,
}

interface TriangeProps {
  style: React.CSSProperties
  x: number
  y: number
  dimension: number
  direction: TriangleDirection
}

function Triangle({ style, x, y, dimension, direction }: TriangeProps) {
  let trianglePath

  switch (direction) {
    case TriangleDirection.Left:
      trianglePath = `M7.5 0 l -5 5 5 5z`
      break
    case TriangleDirection.Right:
      trianglePath = `M2.5 0 l 5 5 -5 5z`
      break
    case TriangleDirection.Up:
      trianglePath = `M0 7.5 l 5 -5 5 5z`
      break
    case TriangleDirection.Down:
    default:
      trianglePath = `M0 2.5 l 5 5 5-5z`
  }

  return (
    <svg x={x - dimension / 2} y={y - dimension / 2} viewBox={`0 0 10 10`} width={dimension} height={dimension}>
      <path style={style} d={trianglePath} />
    </svg>
  )
}

export default Triangle
