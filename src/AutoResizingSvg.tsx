import * as React from 'react'
import { useRef, useState } from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'

const useStyles = makeStyles({
    root: {
        display: 'grid',
        width: '100%',
        height: '100%'
    }
})

type Props = Readonly<{
    children: (width: number, height: number, mouseX: number, mouseY: number) => React.ReactNode
}>

export type SvgCoordinates = Readonly<{ x: number; y: number }>

const AutoResizingSvg = ({ children }: Props) => {
    const classes = useStyles()
    const svgRoot = useRef<SVGSVGElement>(null)
    const [mouseCoordinates, setMouseCoordinates] = useState<SvgCoordinates>({ x: NaN, y: NaN })

    /**
     * Determines the coordinates of the mouse pointer in the coordinate system of the SVG root view port.
     * See http://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
     */
    const mapMouseEvent = (event: React.MouseEvent): SvgCoordinates => {
        const ctm = svgRoot.current!.getScreenCTM()
        if (ctm) {
            return {
                x: (event.clientX - ctm.e) / ctm.a,
                y: (event.clientY - ctm.f) / ctm.d
            }
        } else {
            return { x: NaN, y: NaN }
        }
    }

    const updateMouse = (e: React.MouseEvent) => setMouseCoordinates(mapMouseEvent(e))
    const resetMouse = () => setMouseCoordinates({ x: NaN, y: NaN })

    return (
        <div className={classes.root}>
            <AutoSizer>
                {({ width, height }: Size) => {
                    return (
                        <svg
                            viewBox={`0 0 ${width} ${height}`}
                            width={width}
                            height={height}
                            ref={svgRoot}
                            onMouseEnter={updateMouse}
                            onMouseMove={updateMouse}
                            onMouseLeave={resetMouse}
                        >
                            {children(width, height, mouseCoordinates.x, mouseCoordinates.y)}
                        </svg>
                    )
                }}
            </AutoSizer>
        </div>
    )
}

export default AutoResizingSvg
