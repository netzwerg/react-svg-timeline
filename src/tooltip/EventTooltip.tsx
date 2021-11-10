import * as React from 'react'
import TextSize from '../shared/TextSize'
import { Tooltip } from 'react-svg-tooltip'
import { scaleLinear } from 'd3-scale'
import { TooltipClasses, TOOLTIP_FONT_SIZE } from './useTooltipStyle'

interface Props {
  readonly type: { singleEventX: number } | 'period'
  readonly y: number
  readonly parentWidth: number
  readonly text: string
  readonly triggerRef: React.RefObject<SVGElement>
  readonly classes: TooltipClasses
  readonly tooltipArrow?: boolean
}

export const EventTooltip = ({ type, y, parentWidth, text, triggerRef, classes, tooltipArrow }: Props) => {
  const { textLines, tooltipWidth, tooltipHeight, baseHeight } = getTooltipDimensions(text)

  return (
    <Tooltip triggerRef={triggerRef}>
      {(xOffset, yOffset) => {
        // tooltip follows the mouse, these offsets can be used to counteract this behavior

        // single events: tooltip does NOT follow the mouse (to have a less jumpy user experience)
        // event periods: tooltip does follow the mouse (because rectangular periods can easily get off screen)
        const tooltipX = type === 'period' ? 0 : type.singleEventX - xOffset

        const tooltipYPadding = 12
        const bottomPadding = 30
        const tooltipY = y - yOffset - tooltipYPadding + bottomPadding
        const baseY = y - yOffset - baseHeight - tooltipYPadding

        // determines how the rectangular tooltip area is offset to the left/right of the arrow
        // the closer to the left edge, the more the rect is shifted to the right (same for right edge)
        // if the arrow prop is falsy, safety margin is 0
        const safetyMargin = tooltipArrow ? 15 : 0
        const tooltipOffset = scaleLinear()
          .domain([0, parentWidth])
          .range([safetyMargin, tooltipWidth - safetyMargin])

        // if prop value is falsy, reduce the number so that the tooltip is closer to the event mark
        const arrowDimension = tooltipArrow ? 20 : 10

        const svgX = tooltipX - tooltipOffset(xOffset)!
        const svgY = tooltipY - arrowDimension / 2

        return (
          <g>
            <svg x={svgX} y={svgY} width={tooltipWidth} height={tooltipHeight} className={classes.svg}>
              <rect width="100%" height="100%" className={classes.background} />
              <TooltipText
                textLines={textLines}
                tooltipHeight={tooltipHeight}
                tooltipWidth={tooltipWidth}
                className={classes.text}
              />
            </svg>
            {tooltipArrow && (
              <ArrowDown tipX={tooltipX} baseY={baseY} dimension={arrowDimension} className={classes.background} />
            )}
          </g>
        )
      }}
    </Tooltip>
  )
}

interface ArrowDownProps {
  readonly tipX: number
  readonly baseY: number
  readonly dimension: number
  readonly className: string
}

const ArrowDown = ({ tipX, baseY, dimension, className }: ArrowDownProps) => {
  return (
    <svg
      x={tipX - dimension / 2}
      y={baseY + dimension / 2 + 5} // the triangle is only of height 5
      viewBox={`0 0 10 10`} // path is expressed for a 10x10 square
      width={dimension}
      height={dimension}
    >
      <path className={className} d={`M0 2.5 l 5 5 5-5z`} />
    </svg>
  )
}

/**
 * Calculates the `width` and `height` of the passed tooltip text.
 */
const getTooltipDimensions = (inputText: string) => {
  const text = inputText || ''
  const textLines = text.split('\n')
  const numLinesInText = textLines.length
  const isMultiLineText = numLinesInText > 1
  const horizontalPadding = 15
  const verticalPadding = 5

  let width

  // Calculate required width from the passed text.
  if (isMultiLineText) {
    let maxWidth = 0
    textLines.forEach((textLine) => {
      const textLineWidth = TextSize.getTextWidth(textLine, TOOLTIP_FONT_SIZE)
      maxWidth = Math.max(textLineWidth, maxWidth)
    })
    width = maxWidth + horizontalPadding * 2
  } else {
    width = TextSize.getTextWidth(text, TOOLTIP_FONT_SIZE) + horizontalPadding * 2
  }

  const singleLineHeight = 30
  const tooltipHeight = (isMultiLineText ? 20 * numLinesInText : singleLineHeight) + verticalPadding

  return {
    textLines: textLines,
    tooltipWidth: width,
    tooltipHeight: tooltipHeight,
    baseHeight: singleLineHeight,
  }
}

interface TooltipTextProps {
  readonly textLines: string[]
  readonly className: string
  readonly tooltipWidth: number
  readonly tooltipHeight: number
}

const TooltipText = ({ textLines, className, tooltipWidth, tooltipHeight }: TooltipTextProps) => {
  return (
    <text className={className} width={tooltipWidth} height={tooltipHeight}>
      {textLines.map((textLine, index) => {
        return (
          <tspan dy="1.2em" x="10" key={index} textAnchor="start">
            {textLine}
          </tspan>
        )
      })}
    </text>
  )
}
