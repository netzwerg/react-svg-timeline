import { cleanup, fireEvent, render } from '@testing-library/react'
import * as React from 'react'
import { CssBaseline } from '@material-ui/core'
import { ThemeProvider } from '@material-ui/styles'
import createMuiTheme from '@material-ui/core/styles/createMuiTheme'
import { noOp } from '../../../src/shared'
import MouseCursor from '../../../src/MouseCursor'

const theme = createMuiTheme()

const ComponentUnderTest = ({ isZoomInPossible }: { isZoomInPossible: boolean }) => (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <svg data-testid={'mouse-zoom-cursor'}>
            <MouseCursor
                mousePosition={0}
                cursorLabel={''}
                zoomRangeStart={0}
                zoomRangeEnd={0}
                zoomScale={'1 day'}
                isZoomInPossible={isZoomInPossible}
                isZoomOutPossible={true}
                onZoomIn={noOp}
                onZoomOut={noOp}
                onZoomInCustom={noOp}
                onZoomReset={noOp}
                onPan={noOp}
            />
        </svg>
    </ThemeProvider>
)

afterEach(cleanup)

test('alt key toggles cursor between zoom-in/out', () => {
    const { getByTestId } = render(<ComponentUnderTest isZoomInPossible={true} />)
    const cursorLineElement = getByTestId('mouse-zoom-cursor').getElementsByTagName('line')[0]
    const cursor = () => cursorLineElement.getAttribute('cursor')
    expect(cursor()).toBe('zoom-in')
    fireEvent.keyDown(window, { altKey: true })
    expect(cursor()).toBe('zoom-out')
    fireEvent.keyUp(window, { altKey: false })
    expect(cursor()).toBe('zoom-in')
})
