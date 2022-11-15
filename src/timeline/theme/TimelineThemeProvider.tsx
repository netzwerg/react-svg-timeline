import React from 'react'
import { TimelineThemeContext } from './TimelineThemeContext'
import { TimelineTheme } from './model'

interface Props {
  readonly theme: TimelineTheme
  readonly children: React.ReactNode
}

export const TimelineThemeProvider = ({ theme, children }: Props) => {
  return <TimelineThemeContext.Provider value={theme}>{children}</TimelineThemeContext.Provider>
}
