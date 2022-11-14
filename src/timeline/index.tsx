export * from './model'
export * from './Timeline'
export * from './layers/Marks'
export * from './layers/interaction/model'
export * from './layers/interaction/Interaction'
export * from './shared/ZoomScale'

export { useTimelineTheme } from './theme/useTimelineTheme'
export { createTimelineTheme, deriveTimelineTheme } from './theme/createTimelineTheme'

export type { TimelineTheme } from './theme/model'
export type { TemplateTheme, TimelineThemeOptions } from './theme/createTimelineTheme'
