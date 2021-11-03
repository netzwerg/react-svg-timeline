import { Timeline } from '../src'
import { calcMaxDomain } from '../src/hooks/useTimeline'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
// @ts-ignore – IntelliJ doesn't believe that parcel can import JSON (https://parceljs.org/json.html)
import data from './data.json'

describe('Timeline', () => {
  const events = data.events
  const lanes = data.lanes

  it('render without crashing', () => {
    const div = document.createElement('div')
    const dateFormat = () => 'whatevz'
    ReactDOM.render(<Timeline width={99} height={42} events={events} lanes={lanes} dateFormat={dateFormat} />, div)
    ReactDOM.unmountComponentAtNode(div)
  })

  it('calcMaxDomain', () => {
    expect(calcMaxDomain(events)).toEqual([599612400000, 1399932000000])
  })
})
