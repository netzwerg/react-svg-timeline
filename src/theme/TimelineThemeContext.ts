import * as React from 'react'
import { TimelineTheme } from './model'

export const TimelineThemeContext = React.createContext<TimelineTheme>(null as any)

if (process.env.NODE_ENV !== 'production') {
  TimelineThemeContext.displayName = 'TimelineThemeContext'
}
