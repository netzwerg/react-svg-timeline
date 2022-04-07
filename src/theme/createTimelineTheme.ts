import {
  BaseTheme,
  EventTheme,
  GridTheme,
  MouseCursorTheme,
  TimelineTheme,
  TooltipTheme,
  TrimmerTheme,
  XAxisTheme,
} from './model'
import deepMerge from 'ts-deepmerge'

const ORANGE_DEFAULT = '#ffab40'
const GREY_DEFAULT = '#aaaaaa'
const GREY_500 = '#9e9e9e'
const GREY_200 = '#eeeeee'
const OPACITY_DEFAULT = 0.1

// Abstraction which can cover MUI v4 and v5 themes (without importing any actual MUI lib dependencies)
export interface MaterialTheme {
  palette: {
    background: {
      paper: string
    }
    text: {
      secondary: string
    }
  }
  typography: {
    fontFamily: React.CSSProperties['fontFamily']
    caption: { fontFamily?: React.CSSProperties['fontFamily'] }
  }
}

export const createTimelineTheme = (
  type: 'light' | 'dark',
  materialTheme: MaterialTheme,
  options?: TimelineThemeOptions
): TimelineTheme => {
  const defaults: TimelineTheme = {
    base: {
      backgroundColor: materialTheme.palette.background.paper,
      fontFamily: materialTheme.typography.fontFamily,
      fontFamilyCaption: materialTheme.typography.caption.fontFamily,
    },
    event: {
      pinnedLineColor: type === 'dark' ? 'white' : 'black',
    },
    xAxis: {
      labelColor: materialTheme.palette.text.secondary,
    },
    grid: {
      lineColor: GREY_500,
      weekStripesColor: GREY_200,
      weekStripesOpacity: type === 'light' ? 1 : 0.1,
    },
    lane: {
      laneLabelFontSize: 16,
      middleLineColor: GREY_500,
      middleLineWidth: 1,
    },
    tooltip: {
      backgroundColor: materialTheme.palette.text.secondary,
      fontSize: 14,
      fontFamily: materialTheme.typography.caption.fontFamily,
    },
    trimmer: {
      trimHandleColor: ORANGE_DEFAULT,
      trimHandleLabelColor: ORANGE_DEFAULT,
      trimHandleWidth: 10,
      trimTriangleColor: ORANGE_DEFAULT,
      trimRangeInsideColor: 'transparent',
      trimRangeInsideOpacity: 0,
      trimRangeInsideHighlightColor: ORANGE_DEFAULT,
      trimRangeInsideHighlightOpacity: OPACITY_DEFAULT,
      trimRangeOutsideColor: GREY_DEFAULT,
      trimRangeOutsideOpacity: OPACITY_DEFAULT,
    },
    mouseCursor: {
      lineColor: ORANGE_DEFAULT,
      lineWidth: 2,
      zoomRangeColor: ORANGE_DEFAULT,
      zoomRangeOpacity: OPACITY_DEFAULT,
      labelColor: ORANGE_DEFAULT,
    },
  }
  return options ? deepMerge(defaults, options) : defaults
}

export interface TimelineThemeOptions {
  base?: BaseThemeOptions
  event?: EventThemeOptions
  xAxis?: XAxisThemeOptions
  grid?: GridThemeOptions
  tooltip?: TooltipThemeOptions
  trimmer?: TrimmerThemeOptions
  mouseCursor?: MouseCursorThemeOptions
}

type BaseThemeOptions = Partial<BaseTheme>
type EventThemeOptions = Partial<EventTheme>
type XAxisThemeOptions = Partial<XAxisTheme>
type GridThemeOptions = Partial<GridTheme>
type TooltipThemeOptions = Partial<TooltipTheme>
type TrimmerThemeOptions = Partial<TrimmerTheme>
type MouseCursorThemeOptions = Partial<MouseCursorTheme>
