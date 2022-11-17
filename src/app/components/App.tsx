import React from 'react'

import { InteractionModeType, Timeline } from '../../timeline'

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
        enabledInteractions={[
          InteractionModeType.Hover,
          InteractionModeType.Zoom,
          InteractionModeType.Pan,
          InteractionModeType.RubberBand,
          InteractionModeType.Trim,
        ]}
      />
    </div>
  )
}
