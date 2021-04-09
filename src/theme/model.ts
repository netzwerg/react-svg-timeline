export interface TimelineTheme {
  readonly xAxis: XAxisTheme
  readonly tooltip: TooltipTheme
  readonly trimmer: TrimmerTheme
}

export interface XAxisTheme {
  readonly labelColor: string
}

export interface TooltipTheme {
  readonly backgroundColor: string
}

export interface TrimmerTheme {
  readonly trimHandleColor: string
  readonly trimHandleWidth: number
  readonly trimHandleLabelColor: string
  readonly trimTriangleColor: string
  readonly trimRangeInsideColor: string
  readonly trimRangeInsideOpacity: number
  readonly trimRangeInsideHighlightColor: string
  readonly trimRangeInsideHighlightOpacity: number
  readonly trimRangeOutsideColor: string
  readonly trimRangeOutsideOpacity: number
}
