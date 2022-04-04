import { Theme as MaterialTheme } from '@material-ui/core'
import { MouseCursorTheme, TimelineTheme, TooltipTheme, TrimmerTheme, TypographyTheme, XAxisTheme } from './model'
import deepMerge from 'ts-deepmerge'

const ORANGE_DEFAULT = '#ffab40'
const GREY_DEFAULT = '#aaaaaa'
const GREY_500 = '#9e9e9e'
const OPACITY_DEFAULT = 0.1

// Still relying on Material theme for some defaults
// Eventually, this will be the last dependency, and we can decide to refactor it away...

export const createTimelineTheme = (theme: MaterialTheme, options?: TimelineThemeOptions): TimelineTheme => {
  const defaults: TimelineTheme = {
    typography: {
      fontFamily: theme.typography.fontFamily,
    },
    xAxis: {
      labelColor: theme.palette.text.secondary,
    },
    lane: {
      laneLabelFontSize: 16,
      middleLineColor: GREY_500,
      middleLineWidth: 1,
    },
    tooltip: {
      backgroundColor: theme.palette.text.secondary,
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
    },
  }
  return options ? deepMerge(defaults, options) : defaults
}

export interface TimelineThemeOptions {
  typography?: TypographyThemeOptions
  xAxis?: XAxisThemeOptions
  tooltip?: TooltipThemeOptions
  trimmer?: TrimmerThemeOptions
  mouseCursor?: MouseCursorThemeOptions
}

type TypographyThemeOptions = Partial<TypographyTheme>
type XAxisThemeOptions = Partial<XAxisTheme>
type TooltipThemeOptions = Partial<TooltipTheme>
type TrimmerThemeOptions = Partial<TrimmerTheme>
type MouseCursorThemeOptions = Partial<MouseCursorTheme>
