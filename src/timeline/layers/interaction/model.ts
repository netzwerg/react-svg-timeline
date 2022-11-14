interface InteractionModeNone {
  type: 'none'
}

export const interactionModeNone: InteractionModeNone = { type: 'none' }

interface InteractionModeHover {
  type: 'hover'
}

export const interactionModeHover: InteractionModeHover = { type: 'hover' }

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
  type: 'grabbing'
}

interface InteractionModePanning extends Anchored {
  type: 'panning'
}

type InteractionModeRubberBand =
  | (Anchored & Readonly<{ type: 'rubber band' }>)
  | (InProgress & Readonly<{ type: 'rubber band' }>)

interface InteractionModeAnimationInProgress {
  type: 'animation in progress'
}

export const interactionModeAnimationInProgress: InteractionModeAnimationInProgress = { type: 'animation in progress' }

export interface TrimNone {
  variant: 'none'
}

export interface TrimHover {
  variant: 'trim hover start' | 'trim hover end'
}

interface TrimInProgress {
  variant: 'trim start' | 'trim end' | 'trim pan end'
}

type InteractionModeTrimHover = TrimHover & Readonly<{ type: 'trim' }>

type InteractionModeTrim =
  | (TrimNone & Readonly<{ type: 'trim' }>)
  | InteractionModeTrimHover
  | (TrimInProgress & Readonly<{ type: 'trim' }>)

export type InteractionMode =
  | InteractionModeNone
  | InteractionModeHover
  | InteractionModeAnimationInProgress
  | InteractionModePanning
  | InteractionModeRubberBand
  | InteractionModeTrim
  | InteractionModeGrabbing
