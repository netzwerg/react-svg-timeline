import React from 'react'
import { useEffect, useState } from 'react'
import { Cursor, Domain } from './model'
import { noOp } from './shared'
import { SvgCoordinates } from './MouseAwareSvg'

export interface Props {
  width: number
  height: number
  mousePosition: SvgCoordinates
  isAnimationInProgress: boolean
  isZoomInPossible: boolean
  isZoomOutPossible: boolean
  isTrimming: boolean
  onHover: (mousePositionX: number) => void
  onZoomIn: () => void
  onZoomInCustom: (mouseStartX: number, mouseEndX: number) => void
  onZoomInCustomInProgress: (mouseStartX: number, mouseEndX: number) => void
  onZoomOut: () => void
  onZoomReset: () => void
  onTrimStart: (mousePosX: number) => void
  onTrimEnd: (mousePosX: number) => void
  onPan: (pixelDelta: number) => void
  onInteractionEnd?: () => void
  children: (
    cursor: Cursor,
    interactionMode: InteractionMode,
    setTrimHoverMode: (trimHoverMode: TrimHover | TrimNone) => void
  ) => React.ReactNode
}

interface InteractionModeNone {
  type: 'none'
}

const interactionModeNone: InteractionModeNone = { type: 'none' }

interface InteractionModeHover {
  type: 'hover'
}

const interactionModeHover: InteractionModeHover = { type: 'hover' }

interface Anchored {
  variant: 'anchored'
  anchorX: number
}

interface InProgress {
  variant: 'in progress'
  anchorX: number
  currentX: number
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

const interactionModeAnimationInProgress: InteractionModeAnimationInProgress = { type: 'animation in progress' }

export interface TrimNone {
  variant: 'none'
}

export interface TrimHover {
  variant: 'trim hover start' | 'trim hover end'
  otherX: number
}

interface TrimInProgress {
  variant: 'trim start' | 'trim end'
  otherX: number
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

export const InteractionHandling = ({
  width,
  height,
  mousePosition,
  isAnimationInProgress,
  isZoomInPossible,
  isZoomOutPossible,
  isTrimming,
  onHover,
  onZoomIn,
  onZoomOut,
  onZoomInCustom,
  onZoomInCustomInProgress,
  onZoomReset,
  onTrimStart,
  onTrimEnd,
  onPan,
  onInteractionEnd,
  children,
}: Props) => {
  const [cursor, setCursor] = useState<Cursor>('default')
  const [isAltKeyDown, setAltKeyDown] = useState(false)
  const [isShiftKeyDown, setShiftKeyDown] = useState(false)
  const [interactionMode, setInteractionMode] = useState<InteractionMode>(interactionModeNone)

  useEffect(() => {
    if (isAnimationInProgress) {
      setInteractionMode(interactionModeAnimationInProgress)

      return () => {
        setInteractionMode(interactionModeHover)
      }
    }
    return
  }, [isAnimationInProgress])

  // detect alt-key presses (SVGs are not input components, listeners must be added to the DOM window instead)
  useEffect(() => {
    const onKeyChange = (e: KeyboardEvent) => {
      setAltKeyDown(e.altKey)
      setShiftKeyDown(e.shiftKey)
      if (e.key === 'Escape') {
        onZoomReset()
      }
    }

    window.addEventListener('keydown', onKeyChange)
    window.addEventListener('keyup', onKeyChange)

    // will be called on component unmount
    return () => {
      window.removeEventListener('keydown', onKeyChange)
      window.removeEventListener('keyup', onKeyChange)
    }
  }, [setAltKeyDown, setShiftKeyDown, onZoomReset])

  useEffect(() => {
    if (isTrimming && !isAnimationInProgress) {
      setInteractionMode({ type: 'trim', variant: 'none' })

      return () => {
        setInteractionMode(interactionModeHover)
      }
    }
    return
  }, [isTrimming, isAnimationInProgress, setInteractionMode])

  useEffect(() => {
    if (interactionMode.type === 'animation in progress') {
      setCursor('default')
    } else if (isShiftKeyDown || interactionMode.type === 'rubber band') {
      setCursor('ew-resize')
    } else if (interactionMode.type === 'panning') {
      setCursor('grab')
    } else if (interactionMode.type === 'trim') {
      if (interactionMode.variant !== 'none') {
        setCursor('ew-resize')
      } else {
        setCursor('default')
      }
    } else {
      const getZoomOutCursor = () => (isZoomOutPossible ? 'zoom-out' : 'default')
      const getZoomInCursor = () => (isZoomInPossible ? 'zoom-in' : 'default')
      setCursor(isAltKeyDown ? getZoomOutCursor() : getZoomInCursor())
    }
  }, [isAltKeyDown, isShiftKeyDown, isZoomInPossible, isZoomOutPossible, interactionMode])

  useEffect(() => {
    if (interactionMode.type === 'none' && onInteractionEnd) {
      onInteractionEnd()
    }
  }, [onInteractionEnd, interactionMode])

  const getRubberRange = (anchor: number, position: number): Domain => [
    Math.min(anchor, position),
    Math.max(anchor, position),
  ]

  const onMouseDown = () => {
    const anchored: Anchored = { variant: 'anchored', anchorX: mousePosition.x }

    if (interactionMode.type === 'trim') {
      if (interactionMode.variant === 'trim hover start') {
        setInteractionMode({ type: 'trim', variant: 'trim start', otherX: interactionMode.otherX })
      } else if (interactionMode.variant === 'trim hover end') {
        setInteractionMode({ type: 'trim', variant: 'trim end', otherX: interactionMode.otherX })
      }
    } else if (isShiftKeyDown) {
      setInteractionMode({ type: 'rubber band', ...anchored })
      onZoomInCustomInProgress(...getRubberRange(anchored.anchorX, anchored.anchorX))
    } else {
      setInteractionMode({ type: 'panning', ...anchored })
    }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (interactionMode.type === 'panning') {
      onPan(-e.movementX)
    }
    if (interactionMode.type === 'rubber band') {
      const inProgress: InteractionMode = {
        ...interactionMode,
        variant: 'in progress',
        currentX: mousePosition.x,
      }
      setInteractionMode(inProgress)
      onZoomInCustomInProgress(...getRubberRange(inProgress.anchorX, inProgress.currentX))
    }
    if (interactionMode.type === 'trim') {
      if (interactionMode.variant === 'trim start') {
        onTrimStart(mousePosition.x)
      } else if (interactionMode.variant === 'trim end') {
        onTrimEnd(mousePosition.x)
      }
    }
    if (interactionMode.type === 'hover') {
      onHover(mousePosition.x)
    }
  }

  const onMouseEnter = () => {
    if (interactionMode.type === 'none') {
      setInteractionMode(interactionModeHover)
    }
  }

  const onMouseLeave = () => {
    if (interactionMode.type === 'hover') {
      setInteractionMode(interactionModeNone)
    }
  }

  const onMouseUp = (e: React.MouseEvent) => {
    // anything below threshold is considered a click rather than a drag
    const isPanning = interactionMode.type === 'panning' && Math.abs(interactionMode.anchorX - mousePosition.x) < 5
    const isZoom = e.button === 0 && (interactionMode.type === 'hover' || isPanning)

    if (interactionMode.type === 'rubber band') {
      onZoomInCustom(...getRubberRange(interactionMode.anchorX, mousePosition.x))
    } else if (isZoom) {
      e.altKey ? onZoomOut() : isZoomInPossible ? onZoomIn() : noOp()
    }

    if (interactionMode.type === 'trim') {
      setInteractionMode({ type: 'trim', variant: 'none' })
    } else {
      setInteractionMode(interactionModeHover)
    }
  }

  const setTrimHoverMode = (trimHoverMode: TrimHover | TrimNone) =>
    setInteractionMode((interactionMode) =>
      interactionMode.type === 'trim' &&
      interactionMode.variant !== 'trim start' &&
      interactionMode.variant !== 'trim end'
        ? { type: 'trim', ...trimHoverMode }
        : interactionMode
    )

  return (
    <>
      <defs>
        <clipPath id="clipPath">
          <rect x="0" y="0" width={width} height={height} />
        </clipPath>
      </defs>
      <g
        clipPath="url(#clipPath)"
        pointerEvents={'bounding-box'}
        cursor={cursor}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children(cursor, interactionMode, setTrimHoverMode)}
      </g>
    </>
  )
}
