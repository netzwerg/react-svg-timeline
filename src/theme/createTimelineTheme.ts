import { Theme as MaterialTheme } from '@material-ui/core'
import { TimelineTheme, TooltipTheme, TrimmerTheme } from './model'

const defaultOrange = '#ffab40'
const defaultGrey = '#aaaaaa'
const defaultOpacity = 0.1

// Still relying on Material theme for some defaults
// Eventually, this will be the last dependency, and we can decide to refactor it away...

export const createTimelineTheme = (theme: MaterialTheme, options?: TimelineThemeOptions): TimelineTheme => {
  const defaults: TimelineTheme = {
    tooltip: {
      backgroundColor: theme.palette.text.secondary,
    },
    trimmer: {
      trimHandleColor: defaultOrange,
      trimHandleWidth: 10,
      trimTriangleColor: defaultOrange,
      trimRangeInsideColor: 'transparent',
      trimRangeInsideOpacity: 0,
      trimRangeOutsideColor: defaultGrey,
      trimRangeOutsideOpacity: defaultOpacity,
    },
  }
  return {
    ...defaults,
    tooltip: {
      ...defaults.tooltip,
      ...options?.tooltip,
    },
    trimmer: {
      ...defaults.trimmer,
      ...options?.trimmer,
    },
  }
}

export interface TimelineThemeOptions {
  tooltip?: TooltipThemeOptions
  trimmer?: TrimmerThemeOptions
}

type TooltipThemeOptions = Partial<TooltipTheme>
type TrimmerThemeOptions = Partial<TrimmerTheme>
