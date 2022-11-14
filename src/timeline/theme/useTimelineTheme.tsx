import { TimelineThemeContext } from './TimelineThemeContext'
import { useContext, useDebugValue } from 'react'

export const useTimelineTheme = () => {
  const theme = useContext(TimelineThemeContext)

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDebugValue(theme)
  }

  return theme
}
