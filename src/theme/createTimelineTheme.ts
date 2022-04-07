import { Theme as MaterialTheme } from '@material-ui/core'
import { GridTheme, MouseCursorTheme, TimelineTheme, TooltipTheme, TrimmerTheme, BaseTheme, XAxisTheme } from './model'
import deepMerge from 'ts-deepmerge'

const ORANGE_DEFAULT = '#ffab40'
const GREY_DEFAULT = '#aaaaaa'
const GREY_500 = '#9e9e9e'
const GREY_200 = '#eeeeee'
const OPACITY_DEFAULT = 0.1

// Still relying on Material theme for some defaults
// Eventually, this will be the last dependency, and we can decide to refactor it away...

export const createTimelineTheme = (theme: MaterialTheme, options?: TimelineThemeOptions): TimelineTheme => {
  const defaults: TimelineTheme = {
    base: {
      backgroundColor: theme.palette.background.paper,
      fontFamily: theme.typography.fontFamily,
      fontFamilyCaption: theme.typography.caption.fontFamily,
    },
    xAxis: {
      labelColor: theme.palette.text.secondary,
    },
    grid: {
      lineColor: GREY_500,
      weekStripesColor: GREY_200,
      weekStripesOpacity: theme.palette.type === 'light' ? 1 : 0.1,
    },
    lane: {
      laneLabelFontSize: 16,
      middleLineColor: GREY_500,
      middleLineWidth: 1,
    },
    tooltip: {
      backgroundColor: theme.palette.text.secondary,
      fontSize: 14,
      fontFamily: theme.typography.caption.fontFamily,
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
  typography?: TypographyThemeOptions
  xAxis?: XAxisThemeOptions
  grid?: GridThemeOptions
  tooltip?: TooltipThemeOptions
  trimmer?: TrimmerThemeOptions
  mouseCursor?: MouseCursorThemeOptions
}

type TypographyThemeOptions = Partial<BaseTheme>
type XAxisThemeOptions = Partial<XAxisTheme>
type GridThemeOptions = Partial<GridTheme>
type TooltipThemeOptions = Partial<TooltipTheme>
type TrimmerThemeOptions = Partial<TrimmerTheme>
type MouseCursorThemeOptions = Partial<MouseCursorTheme>
