import * as React from 'react'
import TextSize from '../shared/TextSize'
import { Tooltip } from 'react-svg-tooltip'
import { scaleLinear } from 'd3-scale'
import { CSSProperties } from 'react'
import { useTimelineTheme } from '../theme/useTimelineTheme'

const useTooltipRootSvgStyle = (): CSSProperties => ({
  textAlign: 'left',
})

const useBackgroundStyle = (): CSSProperties => {
  const theme = useTimelineTheme().tooltip
  return { fill: theme.backgroundColor, strokeWidth: 0 }
}

const useTooltipTextStyle = (): CSSProperties => {
  const theme = useTimelineTheme().tooltip
  return {
    fill: 'white',
    dominantBaseline: 'middle',
    textAnchor: 'middle',
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSize,
  }
}

const useUpArrowStyle = (): CSSProperties => {
  return {
    transform: "rotate(180deg)",
    transformOrigin: "50% 50%"
  }
}

interface Props {
  readonly type: { singleEventX: number } | 'period'
  readonly y: number
  readonly parentWidth: number
  readonly text: string
  readonly triggerRef: React.RefObject<SVGElement>
}

export const EventTooltip = ({ type, y, parentWidth, text, triggerRef }: Props) => {
  const tooltipRootSvgStyle = useTooltipRootSvgStyle()
  const tooltipBackgroundStyle = useBackgroundStyle()
  const tooltipTextStyle = useTooltipTextStyle()
  const tooltipFontSize = useTimelineTheme().tooltip.fontSize
  const upArrowStyle = useUpArrowStyle();

  const { textLines, tooltipWidth, tooltipHeight, baseHeight } = getTooltipDimensions(text, tooltipFontSize)

  return (
    <Tooltip triggerRef={triggerRef}>
      {(xOffset, yOffset) => {
        // tooltip follows the mouse, these offsets can be used to counteract this behavior

        // single events: tooltip does NOT follow the mouse (to have a less jumpy user experience)
        // event periods: tooltip does follow the mouse (because rectangular periods can easily get off screen)
        const tooltipX = type === 'period' ? 0 : type.singleEventX - xOffset

        const tooltipYPadding = 12
        const tooltipY = y - yOffset - tooltipHeight - tooltipYPadding // don't follow mouse
        const baseY = y - yOffset - baseHeight - tooltipYPadding

        // determines how the rectangular tooltip area is offset to the left/right of the arrow
        // the closer to the left edge, the more the rect is shifted to the right (same for right edge)
        const safetyMarginX = 15
        const tooltipOffset = scaleLinear()
          .domain([0, parentWidth])
          .range([safetyMarginX, tooltipWidth - safetyMarginX])

        const arrowDimension = 20

        //calculate if tooltip above would he visible
        const safetyMarginY = 10;
        const flipDown = tooltipHeight + (arrowDimension / 2) + safetyMarginY > y;

        const svgX = tooltipX - tooltipOffset(xOffset)!
        const svgY = flipDown ? tooltipY + tooltipHeight + baseHeight : tooltipY - arrowDimension / 2 // flip tooltip below the Event if it would not be fully visible

        // flip the arrow bellow the Event if tooltip would not be fully visible above
        let arrowStyle = tooltipBackgroundStyle;
        let arrowY = baseY;
        if (flipDown) {
          arrowStyle = { ...tooltipBackgroundStyle, ...upArrowStyle };
          arrowY = baseY + baseHeight;
        }

        return (
          <g>
            <svg style={tooltipRootSvgStyle} x={svgX} y={svgY} width={tooltipWidth} height={tooltipHeight}>
              <rect style={tooltipBackgroundStyle} width="100%" height="100%" rx={3} ry={3} />
              <TooltipText
                style={tooltipTextStyle}
                textLines={textLines}
                tooltipHeight={tooltipHeight}
                tooltipWidth={tooltipWidth}
              />
            </svg>
            <Arrow style={arrowStyle} tipX={tooltipX} baseY={arrowY} dimension={arrowDimension} />
          </g>
        )
      }}
    </Tooltip>
  )
}

interface ArrowProps {
  readonly tipX: number
  readonly baseY: number
  readonly dimension: number
  readonly style: CSSProperties
}

const Arrow = ({ tipX, baseY, dimension, style }: ArrowProps) => {
  return (
    <svg
      x={tipX - dimension / 2}
      y={baseY + dimension / 2 + 5} // the triangle is only of height 5
      viewBox={`0 0 10 10`} // path is expressed for a 10x10 square
      width={dimension}
      height={dimension}
    >
      <path style={style} d={`M0 2.5 l 5 5 5-5z`} />
    </svg>
  )
}

/**
 * Calculates the `width` and `height` of the passed tooltip text.
 */
const getTooltipDimensions = (inputText: string, fontSize: number) => {
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
      const textLineWidth = TextSize.getTextWidth(textLine, fontSize)
      maxWidth = Math.max(textLineWidth, maxWidth)
    })
    width = maxWidth + horizontalPadding * 2
  } else {
    width = TextSize.getTextWidth(text, fontSize) + horizontalPadding * 2
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
  readonly style: CSSProperties
  readonly tooltipWidth: number
  readonly tooltipHeight: number
}

const TooltipText = ({ textLines, style, tooltipWidth, tooltipHeight }: TooltipTextProps) => {
  return (
    <text style={style} width={tooltipWidth} height={tooltipHeight}>
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
