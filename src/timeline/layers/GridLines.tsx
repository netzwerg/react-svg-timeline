import * as React from 'react'
import { ScaleLinear, scaleTime } from 'd3-scale'
import { timeMonth } from 'd3-time'
import { monthDuration, weekDuration, yearDuration, ZoomLevels } from '../shared/ZoomScale'
import { addMonths, addWeeks, endOfMonth, endOfWeek, isBefore, isEqual, startOfWeek } from 'date-fns'
import { Domain } from '../model'
import { range } from '../utils'
import { useTimelineTheme } from '../theme/useTimelineTheme'
import { XAxisTheme } from '../theme/model'
import { CSSProperties } from 'react'

interface Props {
  height: number
  domain: Domain
  smallerZoomScale: ZoomLevels
  timeScale: ScaleLinear<number, number>
}

const useGridLineStyle = () => {
  const theme = useTimelineTheme()
  return {
    stroke: theme.grid.lineColor,
  }
}

export const GridLines = ({ height, domain, smallerZoomScale, timeScale }: Props) => {
  switch (smallerZoomScale) {
    case ZoomLevels.TEN_YEARS:
      return <YearView height={height} domain={domain} timeScale={timeScale} showDecadesOnly={true} />
    case ZoomLevels.ONE_YEAR:
      return <YearView height={height} domain={domain} timeScale={timeScale} />
    case ZoomLevels.ONE_MONTH:
      return <MonthView height={height} domain={domain} timeScale={timeScale} />
    default:
      return <MonthView height={height} domain={domain} timeScale={timeScale} showWeekStripes={true} />
  }
}

/* ·················································································································· */
/*  Year
/* ·················································································································· */

const useYearViewTextStyle = (): CSSProperties => {
  const theme = useTimelineTheme()
  return {
    fill: theme.xAxis.labelColor,
    opacity: 0.5,
    fontFamily: theme.base.fontFamilyCaption,
    fontWeight: 'bold',
    textAnchor: 'middle',
    cursor: 'default',
  }
}

interface YearViewProps extends Omit<Props, 'smallerZoomScale'> {
  showDecadesOnly?: boolean
}

const YearView = ({ height, domain, timeScale, showDecadesOnly = false }: YearViewProps) => {
  const xAxisTheme: XAxisTheme = useTimelineTheme().xAxis
  const textStyle = useYearViewTextStyle()
  const gridLineStyle = useGridLineStyle()

  // not calendar-based (and thus not accounting for leap years), but good enough for horizontal placement of labels
  const yearWidth = yearDuration

  const startYear = new Date(domain[0]).getFullYear()
  const endYear = new Date(domain[1]).getFullYear()

  // -1/+1 to get starting/ending lines, additional +1 because range end is exclusive
  const lines = range(startYear - 1, endYear + 2).map((year) => {
    const yearTimestamp = new Date(year, 0, 1).valueOf()
    const x = timeScale(yearTimestamp)!
    const xMidYear = timeScale(yearTimestamp + yearWidth / 2)!
    const width = 2 * (xMidYear - x)
    const fontSize = xAxisTheme.yearLabelFontSize ? xAxisTheme.yearLabelFontSize : Math.max(width * 0.1, 14)
    const isDecade = year % 10 === 0
    return (
      <g key={year}>
        <line style={gridLineStyle} x1={x} y1={0} x2={x} y2={height} />
        <text
          style={textStyle}
          x={xMidYear}
          y="90%"
          fontSize={fontSize}
          writingMode={showDecadesOnly ? 'vertical-lr' : 'horizontal-tb'}
        >
          {showDecadesOnly ? (isDecade ? year : '') : year}
        </text>
      </g>
    )
  })

  return <g>{lines}</g>
}

/* ·················································································································· */
/*  Month
/* ·················································································································· */

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const monthViewLabelFontSize = 18

const useMonthViewTextStyle = (): CSSProperties => {
  const theme = useTimelineTheme()
  return {
    fill: theme.xAxis.labelColor,
    opacity: 0.5,
    fontFamily: theme.base.fontFamilyCaption,
    fontSize: theme.xAxis.monthLabelFontSize ? theme.xAxis.monthLabelFontSize : monthViewLabelFontSize,
    fontWeight: 'bold',
    textAnchor: 'middle',
    cursor: 'default',
  }
}

interface MonthViewProps extends Omit<Props, 'smallerZoomScale'> {
  showWeekStripes?: boolean
}

const MonthView = ({ height, domain, timeScale, showWeekStripes = false }: MonthViewProps) => {
  const textStyle = useMonthViewTextStyle()

  // not calendar-based (fixed 30 days), but good enough for horizontal placement of labels
  const monthWidth = monthDuration

  const scale = scaleTime().domain([new Date(domain[0]), new Date(domain[1])])

  const monthTicks = scale.ticks(timeMonth.every(1)!)

  // TODO: Change year and week view also to use d3 libraries

  const lines = monthTicks.map((monthTick, index) => {
    const monthTimestamp = monthTick.valueOf()
    const month = monthTick.getMonth()
    const year = monthTick.getFullYear()

    const x = timeScale(monthTimestamp)!
    const xMidMonth = timeScale(monthTimestamp + monthWidth / 2)
    const xLast = timeScale(addMonths(monthTimestamp, 1))!
    const isLast = index === monthTicks.length - 1
    return (
      <g key={monthTimestamp}>
        {showWeekStripes && <WeekStripes monthStart={monthTimestamp} timeScale={timeScale} />}
        <MonthLine x={x} month={month} />
        <text style={textStyle} x={xMidMonth} y={height - 1.5 * monthViewLabelFontSize}>
          {monthNames[month]}
        </text>
        <text style={textStyle} x={xMidMonth} y={height - 0.5 * monthViewLabelFontSize}>
          {year}
        </text>
        {isLast && <MonthLine x={xLast} month={month} />}
      </g>
    )
  })

  return <g>{lines}</g>
}

interface MonthLineProps {
  x: number
  month: number
}

const MonthLine = ({ x, month }: MonthLineProps) => {
  const style = useGridLineStyle()
  return (
    <line
      style={style}
      x1={x}
      y1={0}
      x2={x}
      y2="100%"
      strokeWidth={month === 0 ? 2 : 1} // slightly fatter year boundary
    />
  )
}

/* ·················································································································· */
/*  Week
/* ·················································································································· */

interface WeekStripesProps {
  monthStart: number
  timeScale: ScaleLinear<number, number>
}

const WeekStripes = ({ monthStart, timeScale }: WeekStripesProps) => {
  const theme = useTimelineTheme().grid
  const monthEnd = endOfMonth(monthStart)
  const lines = range(1, 6).map((weekNumber) => {
    const weekStart = startOfWeek(addWeeks(monthStart, weekNumber))
    const key = weekNumber
    if (isEqual(weekStart, monthEnd) || isBefore(weekStart, monthEnd)) {
      const x = timeScale(weekStart.valueOf())!
      const atEndOfWeek = endOfWeek(addWeeks(monthStart, weekNumber))
      const width = timeScale(atEndOfWeek.valueOf())! - x
      const weekSinceEpoch = Math.floor(weekStart.valueOf() / weekDuration)
      const fill = weekSinceEpoch % 2 === 0 ? theme.weekStripesColor : 'transparent'
      const opacity = theme.weekStripesOpacity
      return <rect key={key} fill={fill} opacity={opacity} x={x} y={0} width={width} height="100%" />
    } else {
      return <g key={key} />
    }
  })

  return <g>{lines}</g>
}
