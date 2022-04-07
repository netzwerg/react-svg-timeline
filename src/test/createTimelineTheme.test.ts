import { MUI_THEME } from './testTheme'
import { createTimelineTheme } from '../theme/createTimelineTheme'

describe.skip('createTimelineTheme', () => {
  const defaultTheme = createTimelineTheme('light', MUI_THEME)
  expect(defaultTheme).toEqual({
    xAxis: {
      labelColor: 'rgba(0, 0, 0, 0.54)',
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.54)',
    },
    trimmer: {
      trimHandleColor: '#ffab40',
      trimHandleWidth: 10,
      trimHandleLabelColor: '#ffab40',
      trimRangeInsideColor: 'transparent',
      trimRangeInsideHighlightColor: '#ffab40',
      trimRangeInsideHighlightOpacity: 0.1,
      trimRangeInsideOpacity: 0,
      trimRangeOutsideColor: '#aaaaaa',
      trimRangeOutsideOpacity: 0.1,
      trimTriangleColor: '#ffab40',
    },
  })
  it('handle empty options', () => {
    expect(createTimelineTheme('light', MUI_THEME, {})).toEqual(defaultTheme)
  })
  it('merge options into defaults', () => {
    const theme = createTimelineTheme('light', MUI_THEME, {
      tooltip: {
        backgroundColor: 'pink',
      },
    })
    expect(theme).toEqual({
      xAxis: defaultTheme.xAxis,
      tooltip: {
        backgroundColor: 'pink',
      },
      trimmer: defaultTheme.trimmer,
    })
  })
})
