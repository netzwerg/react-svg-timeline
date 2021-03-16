import { createTimelineTheme } from '../dist'
import { createMuiTheme } from '@material-ui/core'

describe('createTimelineTheme', () => {
  const materialTheme = createMuiTheme()
  const defaultTheme = createTimelineTheme(materialTheme)
  expect(defaultTheme).toEqual({
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.54)',
    },
    trimmer: {
      trimHandleColor: '#ffab40',
      trimHandleWidth: 10,
      trimRangeInsideColor: 'transparent',
      trimRangeInsideOpacity: 0,
      trimRangeOutsideColor: '#aaaaaa',
      trimRangeOutsideOpacity: 0.1,
      trimTriangleColor: '#ffab40',
    },
  })
  it('handle empty options', () => {
    expect(createTimelineTheme(materialTheme, {})).toEqual(defaultTheme)
  })
  it('merge options into defaults', () => {
    const theme = createTimelineTheme(materialTheme, {
      tooltip: {
        backgroundColor: 'pink',
      },
    })
    expect(theme).toEqual({
      tooltip: {
        backgroundColor: 'pink',
      },
      trimmer: {
        trimHandleColor: '#ffab40',
        trimHandleWidth: 10,
        trimRangeInsideColor: 'transparent',
        trimRangeInsideOpacity: 0,
        trimRangeOutsideColor: '#aaaaaa',
        trimRangeOutsideOpacity: 0.1,
        trimTriangleColor: '#ffab40',
      },
    })
  })
})
