import * as React from 'react'

export interface TimelineTheme {
  readonly base: BaseTheme
  readonly event: EventTheme
  readonly xAxis: XAxisTheme
  readonly grid: GridTheme
  readonly lane: LaneTheme
  readonly tooltip: TooltipTheme
  readonly trimmer: TrimmerTheme
  readonly mouseCursor: MouseCursorTheme
}

export interface BaseTheme {
  readonly backgroundColor: string
  readonly fontFamily: React.CSSProperties['fontFamily']
  readonly fontFamilyCaption: React.CSSProperties['fontFamily']
}

export interface EventTheme {
  readonly markHeight: number
  readonly markFillColor: string
  readonly markSelectedLineColor: string
  readonly markSelectedFillColor: string
  readonly markPinnedLineColor: string
  readonly markLineColor: string
  readonly markLineWidth: number
  readonly markOpacity: number
  readonly clusterFillColor: string
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
  readonly labelFontSize: number
  readonly labelColor: string
  readonly labelOpacity: number
  readonly middleLineColor: string
  readonly middleLineWidth: number
}

export interface TooltipTheme {
  readonly fontSize: number
  readonly fontFamily: React.CSSProperties['fontFamily']
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
