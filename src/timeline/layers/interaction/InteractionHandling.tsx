import React, { useCallback, useRef } from 'react'
import { useEffect, useState } from 'react'
import { Cursor, Domain } from '../../model'
import { noOp } from '../../utils'
import { SvgCoordinates } from './MouseAwareSvg'
import {
  AllUserInteractions,
  Anchored,
  InteractionMode,
  interactionModeAnimationInProgress,
  interactionModeEntity,
  InteractionModeGrabbing,
  interactionModeHover,
  interactionModeNone,
  InteractionModeType,
  TrimHover,
  TrimNone,
  UserInteraction,
} from './model'

export interface InteractionHandlingProps {
  width: number
  height: number
  mousePosition: SvgCoordinates
  enabledInteractions?: ReadonlyArray<UserInteraction>
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
  onInteractionModeChange?: (interactionMode: InteractionMode) => void
  onInteractionEnd?: () => void
  children: (
    cursor: Cursor,
    interactionMode: InteractionMode,
    enabledInteractions: ReadonlyArray<UserInteraction>,
    setTrimHoverMode: (trimHoverMode: TrimHover | TrimNone) => void
  ) => React.ReactNode
}

export const InteractionHandling = ({
  width,
  height,
  mousePosition,
  enabledInteractions = AllUserInteractions,
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
  onInteractionModeChange,
  onInteractionEnd,
  children,
}: InteractionHandlingProps) => {
  const [cursor, setCursor] = useState<Cursor>('default')
  const [isAltKeyDown, setAltKeyDown] = useState(false)
  const [isShiftKeyDown, setShiftKeyDown] = useState(false)
  const [interactionMode, setInteractionMode] = useState<InteractionMode>(interactionModeNone)

  const interactionZoneRef = useRef<SVGRectElement>(null)

  // Only update interactionMode if user interaction is enabled
  const setInteractionModeIfEnabled = useCallback<React.Dispatch<React.SetStateAction<InteractionMode>>>(
    (setInteractionModeAction) => {
      setInteractionMode((currentInteractionMode) => {
        let nextInteractionMode =
          typeof setInteractionModeAction !== 'function'
            ? setInteractionModeAction
            : setInteractionModeAction(currentInteractionMode)

        if (AllUserInteractions.includes(nextInteractionMode.type as UserInteraction)) {
          if (enabledInteractions.includes(nextInteractionMode.type as UserInteraction)) {
            return nextInteractionMode
          } else {
            return currentInteractionMode
          }
        } else if (
          nextInteractionMode.type === InteractionModeType.Grab &&
          !enabledInteractions.includes(InteractionModeType.Zoom) &&
          !enabledInteractions.includes(InteractionModeType.Pan)
        ) {
          // …grabbing is not allowed if zooming and panning are disabled
          return currentInteractionMode
        } else {
          // …it's not a user interaction, so it's always allowed
          return nextInteractionMode
        }
      })
    },
    [enabledInteractions, setInteractionMode]
  )

  useEffect(() => {
    if (isAnimationInProgress) {
      setInteractionModeIfEnabled(interactionModeAnimationInProgress)

      return () => {
        setInteractionModeIfEnabled(interactionModeHover)
      }
    }
  }, [setInteractionModeIfEnabled, isAnimationInProgress])

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
      setInteractionModeIfEnabled({ type: InteractionModeType.Trim, variant: 'none' })

      return () => {
        setInteractionModeIfEnabled(interactionModeHover)
      }
    }
    return
  }, [isTrimming, isAnimationInProgress, setInteractionModeIfEnabled])

  // TODO: The Cursor is derived state and should be treated as such…
  useEffect(() => {
    if (interactionMode.type === InteractionModeType.AnimationInProgress) {
      setCursor('default')
    } else if (
      (isShiftKeyDown && enabledInteractions.includes(InteractionModeType.RubberBand)) ||
      interactionMode.type === InteractionModeType.RubberBand
    ) {
      setCursor('ew-resize')
    } else if (interactionMode.type === InteractionModeType.Pan) {
      setCursor('grab')
    } else if (interactionMode.type === InteractionModeType.Trim) {
      if (interactionMode.variant !== 'none') {
        setCursor('ew-resize')
      } else {
        setCursor('default')
      }
    } else if (enabledInteractions.includes(InteractionModeType.Zoom)) {
      const getZoomOutCursor = () => (isZoomOutPossible ? 'zoom-out' : 'default')
      const getZoomInCursor = () => (isZoomInPossible ? 'zoom-in' : 'default')
      setCursor(isAltKeyDown ? getZoomOutCursor() : getZoomInCursor())
    } else {
      setCursor('default')
    }
  }, [isAltKeyDown, isShiftKeyDown, isZoomInPossible, isZoomOutPossible, interactionMode, enabledInteractions])

  useEffect(() => {
    if (onInteractionModeChange) {
      onInteractionModeChange(interactionMode)
    }
  }, [onInteractionModeChange, interactionMode])

  useEffect(() => {
    if (interactionMode.type === InteractionModeType.None && onInteractionEnd) {
      onInteractionEnd()
    }
  }, [onInteractionEnd, interactionMode])

  const getRubberRange = (anchor: number, position: number): Domain => [
    Math.min(anchor, position),
    Math.max(anchor, position),
  ]

  const onMouseDown = () => {
    const anchored: Anchored = { variant: 'anchored', anchorX: mousePosition.x }

    if (interactionMode.type === InteractionModeType.Trim) {
      if (isShiftKeyDown) {
        onTrimStart(mousePosition.x)
        setInteractionModeIfEnabled({ type: InteractionModeType.Trim, variant: 'trim pan end' })
      } else if (interactionMode.variant === 'trim hover start') {
        setInteractionModeIfEnabled({ type: InteractionModeType.Trim, variant: 'trim start' })
      } else if (interactionMode.variant === 'trim hover end') {
        setInteractionModeIfEnabled({ type: InteractionModeType.Trim, variant: 'trim end' })
      }
    } else if (isShiftKeyDown && enabledInteractions.includes(InteractionModeType.RubberBand)) {
      setInteractionModeIfEnabled({ type: InteractionModeType.RubberBand, ...anchored })
      onZoomInCustomInProgress(...getRubberRange(anchored.anchorX, anchored.anchorX))
    } else {
      setInteractionModeIfEnabled({ type: InteractionModeType.Grab, ...anchored })
    }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    // anything below threshold is considered a click rather than a drag
    if (interactionMode.type === InteractionModeType.Grab && Math.abs(interactionMode.anchorX - mousePosition.x) > 2) {
      setInteractionModeIfEnabled((previousInteractionMode) => ({
        ...(previousInteractionMode as InteractionModeGrabbing),
        type: InteractionModeType.Pan,
      }))
    }
    if (interactionMode.type === InteractionModeType.Pan) {
      onPan(-e.movementX)
    }
    if (interactionMode.type === InteractionModeType.RubberBand) {
      const inProgress: InteractionMode = {
        ...interactionMode,
        variant: 'in progress',
        currentX: mousePosition.x,
      }
      setInteractionModeIfEnabled(inProgress)
      onZoomInCustomInProgress(...getRubberRange(inProgress.anchorX, inProgress.currentX))
    }
    if (interactionMode.type === InteractionModeType.Trim) {
      if (interactionMode.variant === 'trim start') {
        onTrimStart(mousePosition.x)
      } else if (interactionMode.variant === 'trim end' || interactionMode.variant === 'trim pan end') {
        onTrimEnd(mousePosition.x)
      }
    }
    if (interactionMode.type === InteractionModeType.Hover) {
      onHover(mousePosition.x)
    }
  }

  const onMouseEnter = () => {
    if (interactionMode.type === InteractionModeType.None || interactionMode.type === InteractionModeType.Entity) {
      setInteractionModeIfEnabled(interactionModeHover)
    }
  }

  const onMouseLeave = (e: React.MouseEvent) => {
    if (interactionMode.type === InteractionModeType.Hover || interactionMode.type === InteractionModeType.Pan) {
      const { x, y } = interactionZoneRef.current?.getBoundingClientRect() ?? { x: 0, y: 0 }

      if (e.clientX <= x || e.clientX >= x + width || e.clientY <= y || e.clientY >= y + height) {
        // Leaving the interaction zone
        setInteractionModeIfEnabled(interactionModeNone)
      } else {
        // Not leaving the interaction zone, but interacting with something else
        // probably an event
        setInteractionModeIfEnabled(interactionModeEntity)
      }
    }
  }

  const onMouseUp = (e: React.MouseEvent) => {
    // anything below threshold is considered a click rather than a drag
    const isZoom = e.button === 0 && interactionMode.type === InteractionModeType.Grab

    if (interactionMode.type === InteractionModeType.RubberBand) {
      onZoomInCustom(...getRubberRange(interactionMode.anchorX, mousePosition.x))
    } else if (isZoom && enabledInteractions.includes(InteractionModeType.Zoom)) {
      e.altKey ? onZoomOut() : isZoomInPossible ? onZoomIn() : noOp()
    }

    if (interactionMode.type === InteractionModeType.Trim) {
      setInteractionModeIfEnabled({ type: InteractionModeType.Trim, variant: 'none' })
    } else {
      setInteractionModeIfEnabled(interactionModeHover)
    }
  }

  const setTrimHoverMode = (trimHoverMode: TrimHover | TrimNone) =>
    setInteractionModeIfEnabled((interactionMode) =>
      interactionMode.type === InteractionModeType.Trim &&
      interactionMode.variant !== 'trim start' &&
      interactionMode.variant !== 'trim end' &&
      interactionMode.variant !== 'trim pan end'
        ? { type: InteractionModeType.Trim, ...trimHoverMode }
        : interactionMode
    )

  return (
    <>
      <defs>
        <clipPath id="clipPath">
          <rect ref={interactionZoneRef} x="0" y="0" width={width} height={height} />
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
        {children(cursor, interactionMode, enabledInteractions, setTrimHoverMode)}
      </g>
    </>
  )
}
