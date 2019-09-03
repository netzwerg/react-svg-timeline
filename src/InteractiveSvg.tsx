import * as React from 'react'
import { useRef, useState } from 'react'

type Props = Readonly<{
    width: number
    height: number
    children: (mousePosition: SvgCoordinates) => React.ReactNode
}>

const mousePositionNone = { x: NaN, y: NaN }

export type SvgCoordinates = Readonly<{ x: number; y: number }>

export const InteractiveSvg = ({ width, height, children }: Props) => {
    const svgRoot = useRef<SVGSVGElement>(null)
    const [mousePosition, setMousePosition] = useState<SvgCoordinates>(mousePositionNone)

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
            return mousePositionNone
        }
    }

    const updateMouse = (e: React.MouseEvent) => setMousePosition(mapMouseEvent(e))
    const resetMouse = () => setMousePosition(mousePositionNone)

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
            {children(mousePosition)}
        </svg>
    )
}
