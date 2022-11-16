export enum InteractionModeType {
  None,
  AnimationInProgress,
  Hover,
  Zoom,
  Grab,
  Pan,
  RubberBand,
  Trim,
}

interface InteractionModeNone {
  type: InteractionModeType.None
}

export const interactionModeNone: InteractionModeNone = { type: InteractionModeType.None }

interface InteractionModeHover {
  type: InteractionModeType.Hover
}

export const interactionModeHover: InteractionModeHover = { type: InteractionModeType.Hover }

export interface Anchored {
  variant: 'anchored'
  anchorX: number
}

interface InProgress {
  variant: 'in progress'
  anchorX: number
  currentX: number
}

export interface InteractionModeGrabbing extends Anchored {
  type: InteractionModeType.Grab
}

interface InteractionModePanning extends Anchored {
  type: InteractionModeType.Pan
}

type InteractionModeRubberBand =
  | (Anchored & Readonly<{ type: InteractionModeType.RubberBand }>)
  | (InProgress & Readonly<{ type: InteractionModeType.RubberBand }>)

interface InteractionModeAnimationInProgress {
  type: InteractionModeType.AnimationInProgress
}

export const interactionModeAnimationInProgress: InteractionModeAnimationInProgress = {
  type: InteractionModeType.AnimationInProgress,
}

export interface TrimNone {
  variant: 'none'
}

export interface TrimHover {
  variant: 'trim hover start' | 'trim hover end'
}

interface TrimInProgress {
  variant: 'trim start' | 'trim end' | 'trim pan end'
}

type InteractionModeTrimHover = TrimHover & Readonly<{ type: InteractionModeType.Trim }>

type InteractionModeTrim =
  | (TrimNone & Readonly<{ type: InteractionModeType.Trim }>)
  | InteractionModeTrimHover
  | (TrimInProgress & Readonly<{ type: InteractionModeType.Trim }>)

export type InteractionMode =
  | InteractionModeNone
  | InteractionModeHover
  | InteractionModeAnimationInProgress
  | InteractionModePanning
  | InteractionModeRubberBand
  | InteractionModeTrim
  | InteractionModeGrabbing
