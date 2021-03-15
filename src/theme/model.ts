export interface TimelineTheme {
  readonly tooltip: TooltipTheme
  readonly trimmer: TrimmerTheme
}

export interface TooltipTheme {
  readonly backgroundColor: string
}

export interface TrimmerTheme {
  readonly trimHandle: Readonly<{
    readonly lineColor: string
  }>
  readonly trimRange: Readonly<{
    readonly outsideFillColor: string
  }>
}
