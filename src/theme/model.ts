import * as React from 'react'

export interface TimelineTheme {
  readonly typography: TypographyTheme
  readonly xAxis: XAxisTheme
  readonly grid: GridTheme
  readonly lane: LaneTheme
  readonly tooltip: TooltipTheme
  readonly trimmer: TrimmerTheme
  readonly mouseCursor: MouseCursorTheme
}

export interface TypographyTheme {
  readonly fontFamily: React.CSSProperties['fontFamily']
  readonly fontFamilyCaption: React.CSSProperties['fontFamily']
}

export interface XAxisTheme {
  readonly labelColor: string
  readonly monthLabelFontSize?: number
  readonly yearLabelFontSize?: number
}

export interface GridTheme {
  readonly lineColor: string
  readonly weekStripesColor: string
  readonly weekStripesOpacity: number
}

export interface LaneTheme {
  readonly laneLabelFontSize: number
  readonly middleLineColor: string
  readonly middleLineWidth: number
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

export interface MouseCursorTheme {
  readonly lineColor: string
  readonly lineWidth: number
  readonly zoomRangeColor: string
  readonly zoomRangeOpacity: number
  readonly labelColor: string
}
