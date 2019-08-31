import * as React from 'react'
import { ScaleLinear } from 'd3-scale'
import { Range } from 'immutable'
import { Theme } from '@material-ui/core'
import { monthDuration, nextSmallerZoomScale, weekDuration, yearDuration } from './ZoomScale'
import { addMonths, addWeeks, endOfMonth, endOfWeek, isBefore, isEqual, startOfWeek } from 'date-fns'
import { Domain } from './model'
import makeStyles from '@material-ui/core/styles/makeStyles'
import useTheme from '@material-ui/core/styles/useTheme'

type Props = Readonly<{
    height: number
    domain: Domain
    timeScale: ScaleLinear<number, number>
}>

const gridLineStyle = (theme: Theme) => ({
    line: {
        stroke: theme.palette.grey['500']
    }
})

export const GridLines = ({ height, domain, timeScale }: Props) => {
    const scale = nextSmallerZoomScale(domain)
    switch (scale) {
        case '10 years':
            return <YearView height={height} domain={domain} timeScale={timeScale} showDecadesOnly={true} />
        case '1 year':
            return <YearView height={height} domain={domain} timeScale={timeScale} />
        case '1 month':
            return <MonthView height={height} domain={domain} timeScale={timeScale} />
        default:
            return <MonthView height={height} domain={domain} timeScale={timeScale} showWeekStripes={true} />
    }
}

/* ·················································································································· */
/*  Year
/* ·················································································································· */

const useYearViewStyles = makeStyles((theme: Theme) => ({
    ...gridLineStyle(theme),
    label: {
        fill: theme.palette.text.secondary,
        opacity: 0.5,
        fontFamily: theme.typography.caption.fontFamily,
        fontWeight: 'bold',
        textAnchor: 'middle',
        cursor: 'default'
    }
}))

type YearViewProps = Props &
    Readonly<{
        showDecadesOnly?: boolean
    }>

const YearView = ({ height, domain, timeScale, showDecadesOnly = false }: YearViewProps) => {
    const classes = useYearViewStyles()

    // not calendar-based (and thus not accounting for leap years), but good enough for horizontal placement of labels
    const yearWidth = yearDuration

    const startYear = new Date(domain[0]).getFullYear()
    const endYear = new Date(domain[1]).getFullYear()

    // -1/+1 to get starting/ending lines, additional +1 because range end is exclusive
    const lines = Range(startYear - 1, endYear + 2).map(year => {
        const yearTimestamp = new Date(year, 0, 1).valueOf()
        const x = timeScale(yearTimestamp)
        const xMidYear = timeScale(yearTimestamp + yearWidth / 2)
        const width = 2 * (xMidYear - x)
        const fontSize = Math.max(width * 0.1, 14)
        const isDecade = year % 10 === 0
        return (
            <g key={year}>
                <line className={classes.line} x1={x} y1={0} x2={x} y2={height} />
                <text
                    className={classes.label}
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

const useMonthViewStyles = makeStyles((theme: Theme) => ({
    ...gridLineStyle(theme),
    label: {
        fill: theme.palette.text.secondary,
        opacity: 0.5,
        fontFamily: theme.typography.caption.fontFamily,
        fontSize: monthViewLabelFontSize,
        fontWeight: 'bold',
        textAnchor: 'middle',
        cursor: 'default'
    }
}))

type MonthViewProps = Props &
    Readonly<{
        showWeekStripes?: boolean
    }>

const MonthView = ({ height, domain, timeScale, showWeekStripes = false }: MonthViewProps) => {
    const classes = useMonthViewStyles()

    // not calendar-based (fixed 30 days), but good enough for horizontal placement of labels
    const monthWidth = monthDuration

    const startDate = new Date(domain[0])
    const startYear = startDate.getFullYear()
    const startMonth = startDate.getMonth()

    const endDate = new Date(domain[1])
    const endYear = endDate.getFullYear()
    const endMonth = endDate.getMonth()

    // handle year boundary: iterate further than month 11 (and correct with % 12 again later)
    const rangeEndMonth = startYear === endYear ? endMonth : endMonth + 12
    const monthNumbers = Range(startMonth, rangeEndMonth + 1).toList()

    const lines = monthNumbers.map((rawMonth, index) => {
        const year = rawMonth < 12 ? startYear : endYear
        const month = rawMonth % 12
        const monthDate = new Date(year, month, 1)
        const monthTimestamp = monthDate.valueOf()
        const monthName = monthNames[month]
        const x = timeScale(monthTimestamp)
        const xMidMonth = timeScale(monthTimestamp + monthWidth / 2)
        const xLast = timeScale(addMonths(monthTimestamp, 1))
        const isLast = index === monthNumbers.size - 1
        return (
            <g key={rawMonth}>
                {showWeekStripes && <WeekStripes monthStart={monthTimestamp} timeScale={timeScale} />}
                <MonthLine x={x} month={month} />
                <text className={classes.label} x={xMidMonth} y={height - 1.5 * monthViewLabelFontSize}>
                    {monthName}
                </text>
                <text className={classes.label} x={xMidMonth} y={height - 0.5 * monthViewLabelFontSize}>
                    {year}
                </text>
                {isLast && <MonthLine x={xLast} month={month} />}
            </g>
        )
    })

    return <g>{lines}</g>
}

type MonthLineProps = Readonly<{
    x: number
    month: number
}>

const MonthLine = ({ x, month }: MonthLineProps) => {
    const classes = useMonthViewStyles()
    return (
        <line
            className={classes.line}
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

type WeekStripesProps = Readonly<{
    monthStart: number
    timeScale: ScaleLinear<number, number>
}>

const WeekStripes = ({ monthStart, timeScale }: WeekStripesProps) => {
    const theme: Theme = useTheme()
    const monthEnd = endOfMonth(monthStart)
    const lines = Range(1, 6).map(weekNumber => {
        const weekStart = startOfWeek(addWeeks(monthStart, weekNumber))
        const key = weekNumber
        if (isEqual(weekStart, monthEnd) || isBefore(weekStart, monthEnd)) {
            const x = timeScale(weekStart.valueOf())
            const atEndOfWeek = endOfWeek(addWeeks(monthStart, weekNumber))
            const width = timeScale(atEndOfWeek.valueOf()) - x
            const weekSinceEpoch = Math.floor(weekStart.valueOf() / weekDuration)
            const fill = weekSinceEpoch % 2 === 0 ? theme.palette.grey['200'] : 'transparent'
            const opacity = theme.palette.type === 'light' ? 1 : 0.1
            return <rect key={key} fill={fill} opacity={opacity} x={x} y={0} width={width} height="100%" />
        } else {
            return <g key={key} />
        }
    })

    return <g>{lines}</g>
}
