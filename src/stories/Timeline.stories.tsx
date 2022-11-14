import React from 'react'
import { Meta, Story } from '@storybook/react'
import { Timeline, TimelineEvent, TimelineProps } from '../timeline'

import dataSet from '../app/data/smallDataset.json'

export default {
  title: 'Timeline',
  component: Timeline,
} as Meta

const Template: Story<TimelineProps<string, string, TimelineEvent<string, string>>> = (args) => (
  <div style={{ width: 1000, height: 300 }}>
    <Timeline {...args} />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  events: dataSet.events,
  lanes: dataSet.lanes,
  dateFormat: (date) => `${date}`,
  width: 1000,
  height: 300,
}
