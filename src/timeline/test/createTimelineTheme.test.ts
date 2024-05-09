import { createTimelineTheme, deriveTimelineTheme, TemplateTheme } from '../theme/createTimelineTheme'

describe('createTimelineTheme', () => {
  it('createTimelineTheme', () => {
    const theme = createTimelineTheme()
    expect(theme).toBeDefined()
  })
  it('createTimelineTheme with options', () => {
    const theme = createTimelineTheme({ event: { markHeight: 42 } })
    expect(theme.event.markHeight).toEqual(42)
  })
  it('deriveTimelineTheme', () => {
    const template: TemplateTheme = {
      palette: {
        primary: {
          main: 'red',
        },
        warning: {
          main: '#ffa726',
          dark: '#f57c00',
        },
        secondary: {
          main: '#ce93d8',
          dark: '#ab47bc',
        },
        background: {
          paper: 'green',
        },
        text: {
          secondary: 'blue',
        },
      },
      typography: {
        fontFamily: 'my-fancy-font-family',
        caption: { fontFamily: 'my-fancy-caption-font-family' },
      },
    }

    const options = {
      tooltip: {
        backgroundColor: 'pink',
      },
    }

    const theme = deriveTimelineTheme('light', template, options)

    expect(theme).toEqual({
      base: {
        backgroundColor: 'green',
        fontFamily: 'my-fancy-font-family',
        fontFamilyCaption: 'my-fancy-caption-font-family',
      },
      event: {
        markHeight: 20,
        markFillColor: 'red',
        markSelectedLineColor: '#ffff8d',
        markSelectedFillColor: 'rgba(255, 255, 141, 0.5)',
        markPinnedLineColor: 'black',
        clusterFillColor: 'red',
      },
      xAxis: { labelColor: 'blue' },
      grid: {
        lineColor: '#9e9e9e',
        weekStripesColor: '#eeeeee',
        weekStripesOpacity: 1,
      },
      lane: {
        labelFontSize: 16,
        labelColor: 'red',
        middleLineColor: '#9e9e9e',
        middleLineWidth: 1,
      },
      tooltip: {
        backgroundColor: 'pink',
        fontSize: 14,
        fontFamily: 'my-fancy-caption-font-family',
      },
      trimmer: {
        trimHandleColor: '#ffab40',
        trimHandleLabelColor: '#ffab40',
        trimHandleWidth: 10,
        trimTriangleColor: '#ffab40',
        trimRangeInsideColor: 'transparent',
        trimRangeInsideOpacity: 0,
        trimRangeInsideHighlightColor: '#ffab40',
        trimRangeInsideHighlightOpacity: 0.1,
        trimRangeOutsideColor: '#aaaaaa',
        trimRangeOutsideOpacity: 0.1,
      },
      mouseCursor: {
        lineColor: '#ffab40',
        lineWidth: 2,
        zoomRangeColor: '#ffab40',
        zoomRangeOpacity: 0.1,
        labelColor: '#ffab40',
      },
    })
  })
})
