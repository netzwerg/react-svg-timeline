import React from 'react'
import { createRoot } from 'react-dom/client'

import { render, screen } from './test-utils'

// @ts-ignore – IntelliJ doesn't believe that parcel can import JSON (https://parceljs.org/json.html)
import data from './data.json'
import { Timeline } from '../Timeline'
import { calcMaxDomain } from '../hooks/useTimeline'
import { act } from 'react-dom/test-utils'

describe('Timeline', () => {
  const events = data.events
  const lanes = data.lanes

  it('renders without crashing', () => {
    const div = document.createElement('div')
    const dateFormat = () => 'whatevz'

    act(() => {
      const root = createRoot(div)
      root.render(<Timeline width={99} height={42} events={events} lanes={lanes} dateFormat={dateFormat} />)
      root.unmount()
    })
  })

  it('renders a custom layer', () => {
    const dateFormat = () => 'whatevz'

    render(
      <Timeline
        width={99}
        height={42}
        events={events}
        lanes={lanes}
        dateFormat={dateFormat}
        layers={['axes', 'grid', ({ height }) => <g>Test Layer {height}</g>]}
      />
    )

    expect(screen.getByText('Test Layer 42')).toBeInTheDocument()
  })

  it('calculates the max domain span', () => {
    expect(calcMaxDomain(events)).toEqual([599612400000, 1399932000000])
  })
})
