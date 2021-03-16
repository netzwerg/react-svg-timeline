export interface TimelineTheme {
  readonly tooltip: TooltipTheme
  readonly trimmer: TrimmerTheme
}

export interface TooltipTheme {
  readonly backgroundColor: string
}

export interface TrimmerTheme {
  readonly trimHandleColor: string
  readonly trimHandleWidth: number
  readonly trimTriangleColor: string
  readonly trimRangeInsideColor: string
  readonly trimRangeInsideOpacity: number
  readonly trimRangeOutsideColor: string
  readonly trimRangeOutsideOpacity: number
}
