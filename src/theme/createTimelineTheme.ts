import { Theme as MaterialTheme } from '@material-ui/core'
import { TimelineTheme } from './model'
import { orange } from '@material-ui/core/colors'

// Still relying on Material theme for defaults
// Eventually, this will be the last dependency, and we can decide to
// refactor it away...

// TODO: More type-safe overrides (while still keeping everything optional, even nested fields)

export const createTimelineTheme = (theme: MaterialTheme, overrides?: any): TimelineTheme => {
  const defaults: TimelineTheme = {
    tooltip: {
      backgroundColor: theme.palette.text.secondary,
    },
    trimmer: {
      trimHandle: {
        lineColor: orange.A200,
      },
      trimRange: {
        outsideFillColor: orange.A200,
      },
    },
  }
  return {
    ...defaults,
    ...overrides,
  }
}
