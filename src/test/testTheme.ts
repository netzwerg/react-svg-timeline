import { createTimelineTheme, MaterialTheme } from '../theme/createTimelineTheme'
import { TimelineTheme } from '../theme/model'

export const MUI_THEME: MaterialTheme = {
  palette: {
    primary: {
      main: '#00bcd4',
    },
    background: {
      paper: 'pink',
    },
    text: {
      secondary: 'rgba(0, 0, 0, 0.54)',
    },
  },
  typography: {
    fontFamily: 'serif',
    caption: { fontFamily: 'serif' },
  },
}

export const THEME: TimelineTheme = createTimelineTheme('light', MUI_THEME)
