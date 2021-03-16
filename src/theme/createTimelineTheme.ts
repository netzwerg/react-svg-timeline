import { Theme as MaterialTheme } from '@material-ui/core'
import { TimelineTheme, TooltipTheme, TrimmerTheme, XAxisTheme } from './model'
import deepMerge from 'ts-deepmerge'

const defaultOrange = '#ffab40'
const defaultGrey = '#aaaaaa'
const defaultOpacity = 0.1

// Still relying on Material theme for some defaults
// Eventually, this will be the last dependency, and we can decide to refactor it away...

export const createTimelineTheme = (theme: MaterialTheme, options?: TimelineThemeOptions): TimelineTheme => {
  const defaults: TimelineTheme = {
    xAxis: {
      labelColor: theme.palette.text.secondary,
    },
    tooltip: {
      backgroundColor: theme.palette.text.secondary,
    },
    trimmer: {
      trimHandleColor: defaultOrange,
      trimHandleLabelColor: defaultOrange,
      trimHandleWidth: 10,
      trimTriangleColor: defaultOrange,
      trimRangeInsideColor: 'transparent',
      trimRangeInsideOpacity: 0,
      trimRangeOutsideColor: defaultGrey,
      trimRangeOutsideOpacity: defaultOpacity,
    },
  }
  return options ? deepMerge(defaults, options) : defaults
}

export interface TimelineThemeOptions {
  xAxis?: XAxisThemeOptions
  tooltip?: TooltipThemeOptions
  trimmer?: TrimmerThemeOptions
}

type XAxisThemeOptions = Partial<XAxisTheme>
type TooltipThemeOptions = Partial<TooltipTheme>
type TrimmerThemeOptions = Partial<TrimmerTheme>
