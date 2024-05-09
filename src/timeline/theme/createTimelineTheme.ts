import {
  BaseTheme,
  EventTheme,
  GridTheme,
  LaneTheme,
  MouseCursorTheme,
  TimelineTheme,
  TooltipTheme,
  TrimmerTheme,
  XAxisTheme,
} from './model'
import deepMerge from 'ts-deepmerge'

const ORANGE_DEFAULT = '#ffab40'
const GREY_DEFAULT = '#aaaaaa'
const GREY_500 = '#9e9e9e'
const GREY_200 = '#eeeeee'
const OPACITY_DEFAULT = 0.1

const DEFAULT_TEMPLATE_THEME: TemplateTheme = {
  palette: {
    primary: {
      main: '#1976d2',
    },
    warning: {
      main: '#ffa726',
      dark: '#f57c00',
    },
    secondary: {
      main: '#ce93d8',
      dark: '#ab47bc',
    },
    background: {
      paper: '#fff',
    },
    text: {
      secondary: GREY_500,
    },
  },
  typography: {
    fontFamily: 'sans-serif',
    caption: {},
  },
}

/**
 * Abstraction of a template theme which covers MUI v4 and v5 themes
 * without actually importing any MUI library dependencies.
 */
export interface TemplateTheme {
  palette: {
    primary: {
      main: string
    }
    warning: {
      main: string
      dark: string
    }
    secondary: {
      main: string
      dark: string
    }
    background: {
      paper: string
    }
    text: {
      secondary: string
    }
  }
  typography: {
    fontFamily: React.CSSProperties['fontFamily']
    caption: { fontFamily?: React.CSSProperties['fontFamily'] }
  }
}

/**
 * Creates a default theme for the timeline (suitable for light backgrounds).
 *
 * @param options selective overrides of defaults.
 */
export const createTimelineTheme = (options?: TimelineThemeOptions) =>
  deriveTimelineTheme('light', DEFAULT_TEMPLATE_THEME, options)

/**
 * A convenience function to derive a timeline theme from a template theme.
 * Especially useful to create a timeline theme from a MUI v4 or v5 theme.
 *
 * @param type indicates whether theme will be used on a light or dark background.
 * @param muiLikeTemplateTheme a template abstracting over MUI v4 and v5 theme interfaces.
 * @param options selective overrides of defaults/template.
 */
export const deriveTimelineTheme = (
  type: 'light' | 'dark',
  muiLikeTemplateTheme: TemplateTheme,
  options?: TimelineThemeOptions
): TimelineTheme => {
  const selectionColor = muiLikeTemplateTheme.palette.secondary.main ?? ORANGE_DEFAULT
  const defaults: TimelineTheme = {
    base: {
      backgroundColor: muiLikeTemplateTheme.palette.background.paper,
      fontFamily: muiLikeTemplateTheme.typography.fontFamily,
      fontFamilyCaption: muiLikeTemplateTheme.typography.caption.fontFamily,
    },
    event: {
      markHeight: 20,
      markFillColor: muiLikeTemplateTheme.palette.primary.main,
      markOpacity: 0.3,
      markLineColor: muiLikeTemplateTheme.palette.primary.main,
      markLineWidth: 2,
      markSelectedLineColor: '#ffff8d',
      markSelectedFillColor: 'rgba(255, 255, 141, 0.5)',
      markPinnedLineColor: type === 'dark' ? 'white' : 'black',
      clusterFillColor: muiLikeTemplateTheme.palette.primary.main,
    },
    xAxis: {
      labelColor: muiLikeTemplateTheme.palette.text.secondary,
    },
    grid: {
      lineColor: GREY_500,
      weekStripesColor: GREY_200,
      weekStripesOpacity: type === 'light' ? 1 : 0.1,
    },
    lane: {
      labelFontSize: 16,
      labelOpacity: 0.7,
      labelColor: muiLikeTemplateTheme.palette.primary.main,
      middleLineColor: GREY_500,
      middleLineWidth: 1,
    },
    tooltip: {
      backgroundColor: muiLikeTemplateTheme.palette.text.secondary,
      fontSize: 14,
      fontFamily: muiLikeTemplateTheme.typography.caption.fontFamily,
    },
    trimmer: {
      trimHandleColor: selectionColor,
      trimHandleLabelColor: selectionColor,
      trimHandleWidth: 10,
      trimTriangleColor: selectionColor,
      trimRangeInsideColor: 'transparent',
      trimRangeInsideOpacity: 0,
      trimRangeInsideHighlightColor: selectionColor,
      trimRangeInsideHighlightOpacity: OPACITY_DEFAULT,
      trimRangeOutsideColor: GREY_DEFAULT,
      trimRangeOutsideOpacity: OPACITY_DEFAULT,
    },
    mouseCursor: {
      lineColor: selectionColor,
      lineWidth: 2,
      zoomRangeColor: selectionColor,
      zoomRangeOpacity: OPACITY_DEFAULT,
      labelColor: selectionColor,
    },
  }
  return options ? (deepMerge(defaults, options) as TimelineTheme) : defaults
}

export interface TimelineThemeOptions {
  base?: BaseThemeOptions
  event?: EventThemeOptions
  xAxis?: XAxisThemeOptions
  grid?: GridThemeOptions
  lane?: LaneThemeOptions
  tooltip?: TooltipThemeOptions
  trimmer?: TrimmerThemeOptions
  mouseCursor?: MouseCursorThemeOptions
}

type BaseThemeOptions = Partial<BaseTheme>
type EventThemeOptions = Partial<EventTheme>
type XAxisThemeOptions = Partial<XAxisTheme>
type GridThemeOptions = Partial<GridTheme>
type LaneThemeOptions = Partial<LaneTheme>
type TooltipThemeOptions = Partial<TooltipTheme>
type TrimmerThemeOptions = Partial<TrimmerTheme>
type MouseCursorThemeOptions = Partial<MouseCursorTheme>
