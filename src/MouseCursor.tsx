import * as React from 'react'
import { Theme } from '@material-ui/core'
import { ZoomScale } from './ZoomScale'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { orange } from '@material-ui/core/colors'
import { Cursor } from './model'
import { InteractionMode } from './InteractionHandling'

const useStyles = makeStyles((theme: Theme) => ({
    cursor: {
        stroke: orange.A200,
        strokeWidth: 2
    },
    label: {
        fill: orange.A200,
        textAnchor: 'middle',
        dominantBaseline: 'middle',
        fontFamily: theme.typography.caption.fontFamily,
        cursor: 'default'
    },
    zoomRange: {
        fill: orange.A200,
        opacity: 0.1
    }
}))

type Props = Readonly<{
    mousePosition: number
    cursorLabel: string
    cursor: Cursor
    interactionMode: InteractionMode
    zoomRangeStart: number
    zoomRangeEnd: number
    zoomScale: ZoomScale
    isZoomInPossible: boolean
}>

export const MouseCursor = ({
    mousePosition,
    cursorLabel,
    cursor,
    interactionMode,
    zoomRangeStart,
    zoomRangeEnd,
    zoomScale,
    isZoomInPossible
}: Props) => {
    if (isNaN(mousePosition)) {
        return <g />
    } else {
        const cursorComponent = () => {
            switch (interactionMode.type) {
                case 'animation in progress': {
                    return <g />
                }
                case 'panning':
                    return <PanningCursor mousePosition={mousePosition} />
                case 'rubber band': {
                    const [start, end] =
                        interactionMode.variant === 'anchored'
                            ? [interactionMode.anchorX, undefined]
                            : [interactionMode.anchorX, interactionMode.currentX]
                    return <RubberBandCursor start={start} end={end} />
                }
                default:
                    return (
                        <ZoomCursor
                            mousePosition={mousePosition}
                            cursor={cursor}
                            cursorLabel={cursorLabel}
                            zoomScale={zoomScale}
                            isZoomInPossible={isZoomInPossible}
                            zoomRangeStart={zoomRangeStart}
                            zoomRangeEnd={zoomRangeEnd}
                        />
                    )
            }
        }

        return (
            <g>
                {/* covering complete area prevents flickering cursor and asserts that mouse events are caught */}
                <rect x={0} y={0} width={'100%'} height={'100%'} fill={'transparent'} />
                {cursorComponent()}
            </g>
        )
    }
}

/* ·················································································································· */
/*  Zoom
/* ·················································································································· */

type ZoomCursorProps = Readonly<{
    mousePosition: number
    cursor: Cursor
    cursorLabel: string
    zoomScale: ZoomScale
    isZoomInPossible: boolean
    zoomRangeStart: number
    zoomRangeEnd: number
}>

const ZoomCursor = ({
    mousePosition,
    cursor,
    cursorLabel,
    zoomScale,
    isZoomInPossible,
    zoomRangeStart,
    zoomRangeEnd
}: ZoomCursorProps) => {
    const classes = useStyles()
    return (
        <g>
            <rect
                visibility={isZoomInPossible ? 'visible' : 'hidden'}
                className={classes.zoomRange}
                x={zoomRangeStart}
                y={0}
                width={zoomRangeEnd - zoomRangeStart}
                height="100%"
                cursor={cursor}
            />
            <line className={classes.cursor} x1={mousePosition} y1="0%" x2={mousePosition} y2="5%" cursor={cursor} />
            <text className={classes.label} x={mousePosition} y={isZoomInPossible ? '11%' : '15%'} cursor={cursor}>
                <tspan x={mousePosition} cursor={cursor}>
                    {cursorLabel}
                </tspan>
                <tspan x={mousePosition} dy={18} cursor={cursor}>
                    {isZoomInPossible ? zoomScale : ''}
                </tspan>
            </text>
            <line className={classes.cursor} x1={mousePosition} y1="23%" x2={mousePosition} y2="100%" cursor={cursor} />
        </g>
    )
}

/* ·················································································································· */
/*  Panning
/* ·················································································································· */

type PanningProps = Readonly<{
    mousePosition: number
}>

const PanningCursor = ({ mousePosition }: PanningProps) => {
    const classes = useStyles()
    return (
        <g>
            <line
                className={classes.cursor}
                x1={mousePosition}
                y1={'0%'}
                x2={mousePosition}
                y2={'100%'}
                cursor={'grab'}
            />
        </g>
    )
}

/* ·················································································································· */
/*  RubberBand
/* ·················································································································· */

type RubberBandProps = Readonly<{
    start: number
    end?: number
}>

const RubberBandCursor = ({ start, end }: RubberBandProps) => {
    const classes = useStyles()
    const [y1, y2] = ['0%', '100%']
    return (
        <g>
            <line className={classes.cursor} x1={start} y1={y1} x2={start} y2={y2} />
            {end && (
                <g>
                    <line className={classes.cursor} x1={end} y1={y1} x2={end} y2={y2} />
                    <rect
                        className={classes.zoomRange}
                        x={Math.min(start, end)}
                        y={y1}
                        width={Math.abs(end - start)}
                        height={y2}
                    />
                </g>
            )}
        </g>
    )
}
