import React from 'react'

import { Timeline } from '../../timeline'

import dataSet from '../data/smallDataset.json'

export const App = () => {
  return (
    <div>
      <h1>react-svg-timeline</h1>
      <Timeline
        events={dataSet.events}
        lanes={dataSet.lanes}
        dateFormat={(date) => `${date}`}
        width={1000}
        height={300}
      />
    </div>
  )
}
