import { Timeline, TimelineProps } from '../../src'
import * as React from 'react'
import FavoriteIcon from '@material-ui/icons/Favorite'

export const CustomizedTimeline = (props: TimelineProps) => {
    // Often, it is useful to draw events semi-transparently, such that 'event accumulations' become visible
    // This raises the issue of grid-lines shining through
    // To give you the possibility to draw opaque event marks in the background and semi-transparent events in the
    // foreground, the eventComponent factory is invoked twice (with the 'role' parameter distinguishing the calls)

    const eventComponent = (e, role, timeScale, y) => {
        const color = role === 'background' ? 'white' : 'rgb(233, 30, 99, 0.5)'
        const size = 24
        const startX = timeScale(e.startTimeMillis)
        if (e.endTimeMillis === undefined) {
            const iconTranslate = `translate(${startX - size / 2}, ${y - size / 2})`
            return (
                <g transform={`${iconTranslate}`}>
                    <FavoriteIcon width={size} height={size} style={{ color }} />
                </g>
            )
        } else {
            const endX = timeScale(e.endTimeMillis)
            const width = endX - startX
            return (
                <g>
                    <rect x={startX} y={y - size / 2} width={width} height={size} fill={color} rx={5} />
                </g>
            )
        }
    }

    return <Timeline {...props} eventComponent={eventComponent} />
}
