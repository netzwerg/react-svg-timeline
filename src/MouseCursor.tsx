import * as React from 'react'
import { useEffect, useState } from 'react'
import { Theme } from '@material-ui/core'
import { ZoomScale } from 'ZoomScale.tsx'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { orange } from '@material-ui/core/colors'
import { noOp } from './shared'

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

type None = Readonly<{ type: 'none' }>
const none: None = { type: 'none' }
type Anchored = Readonly<{ variant: 'anchored'; anchorX: number }>
type InProgress = Readonly<{ variant: 'in progress'; anchorX: number; currentX: number }>
type Panning = Anchored & Readonly<{ type: 'panning' }>
type RubberBand = Anchored & Readonly<{ type: 'rubber band' }> | InProgress & Readonly<{ type: 'rubber band' }>
type Mode = None | Panning | RubberBand

type Props = Readonly<{
    mousePosition: number
    cursorLabel: string
    zoomRangeStart: number
    zoomRangeEnd: number
    zoomScale: ZoomScale
    isZoomInPossible: boolean
    isZoomOutPossible: boolean
    onZoomIn: () => void
    onZoomInCustom: (mouseStartX: number, mouseEndX: number) => void
    onZoomOut: () => void
    onZoomReset: () => void
    onPan: (pixelDelta: number) => void
}>

const MouseCursor = ({
    mousePosition,
    cursorLabel,
    zoomRangeStart,
    zoomRangeEnd,
    zoomScale,
    isZoomInPossible,
    isZoomOutPossible,
    onZoomIn,
    onZoomInCustom,
    onZoomOut,
    onZoomReset,
    onPan
}: Props) => {
    const [isAltKeyDown, setAltKeyDown] = useState(false)
    const [zoomCursor, setZoomCursor] = useState()
    const [mode, setMode] = useState<Mode>(none)

    // detect alt-key presses (SVGs are not input components, listeners must be added to the DOM window instead)
    useEffect(() => {
        const onKeyChange = (e: KeyboardEvent) => {
            setAltKeyDown(e.altKey)
            if (e.key === 'Escape') {
                onZoomReset()
            }
        }

        window.addEventListener('keydown', onKeyChange)
        window.addEventListener('keyup', onKeyChange)

        // will be called on component unmount
        return () => {
            window.removeEventListener('keydown', onKeyChange)
            window.removeEventListener('keyup', onKeyChange)
        }
    })

    useEffect(() => {
        const getZoomOutCursor = () => (isZoomOutPossible ? 'zoom-out' : 'default')
        const getZoomInCursor = () => (isZoomInPossible ? 'zoom-in' : 'default')
        setZoomCursor(isAltKeyDown ? getZoomOutCursor() : getZoomInCursor())
    }, [isAltKeyDown, isZoomInPossible, isZoomOutPossible])

    if (isNaN(mousePosition)) {
        return <g />
    } else {
        const onMouseDown = (e: React.MouseEvent) => {
            const anchored: Anchored = { variant: 'anchored', anchorX: mousePosition }
            if (e.shiftKey) {
                setMode({ type: 'rubber band', ...anchored })
            } else {
                setMode({ type: 'panning', ...anchored })
            }
        }

        const onMouseMove = (e: React.MouseEvent) => {
            if (mode.type === 'panning') {
                onPan(-e.movementX)
            }
            if (mode.type === 'rubber band') {
                const inProgress: Mode = { ...mode, variant: 'in progress', currentX: mousePosition }
                setMode(inProgress)
            }
        }

        const onMouseUp = (e: React.MouseEvent) => {
            // anything below threshold is considered a click rather than a drag
            const isPanning = mode.type === 'panning' && Math.abs(mode.anchorX - mousePosition) < 5
            const isZoom = e.button === 0 && (mode.type === 'none' || isPanning)

            if (mode.type === 'rubber band') {
                const min = Math.min(mode.anchorX, mousePosition)
                const max = Math.max(mode.anchorX, mousePosition)
                onZoomInCustom(min, max)
            } else if (isZoom) {
                e.altKey ? onZoomOut() : isZoomInPossible ? onZoomIn() : noOp()
            }

            setMode(none)
        }

        const cursorComponent = () => {
            switch (mode.type) {
                case 'panning':
                    return <PanningCursor mousePosition={mousePosition} />
                case 'rubber band': {
                    const [start, end] =
                        mode.variant === 'anchored' ? [mode.anchorX, undefined] : [mode.anchorX, mode.currentX]
                    return <RubberBandCursor start={start} end={end} />
                }
                default:
                    return (
                        <ZoomCursor
                            mousePosition={mousePosition}
                            cursor={zoomCursor}
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
            <g onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
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
    cursor: string
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
            <line className={classes.cursor} x1={start} y1={y1} x2={start} y2={y2} cursor="ew-resize" />
            {end && (
                <g>
                    <line className={classes.cursor} x1={end} y1={y1} x2={end} y2={y2} cursor="ew-resize" />
                    <rect
                        className={classes.zoomRange}
                        x={Math.min(start, end)}
                        y={y1}
                        width={Math.abs(end - start)}
                        height={y2}
                        cursor="ew-resize"
                    />
                </g>
            )}
        </g>
    )
}

export default MouseCursor
