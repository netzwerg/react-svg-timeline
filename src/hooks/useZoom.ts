import { ScaleLinear } from 'd3-scale'
import { useZoomLevels } from './useZoomLevels'
import { getDomainSpan, ZoomLevels, ZoomScale, zoomScaleWidth } from '../shared/ZoomScale'
import { Domain } from '../model'

interface UseZoomProps {
  domain: Domain
  maxDomainStart: number
  maxDomainEnd: number
  zoomLevels: ReadonlyArray<ZoomLevels>
  isDomainChangePossible: boolean
  timeScale: ScaleLinear<number, number>
  onDomainChange: (domain: Domain, animated: boolean) => void
  onCursorMove?: (millisAtCursor?: number, startMillis?: number, endMillis?: number) => void
}

export const useZoom = ({
  domain,
  maxDomainStart,
  maxDomainEnd,
  zoomLevels,
  isDomainChangePossible,
  timeScale,
  onDomainChange,
  onCursorMove,
}: UseZoomProps): {
  currentZoomScale: ZoomLevels
  zoomWidth: number
  nextSmallerZoomScale: ZoomLevels
  nextBiggerZoomScale: ZoomLevels
  isZoomInPossible: boolean
  isZoomOutPossible: boolean
  onZoomIn: (timeAtCursor?: number | undefined) => void
  onZoomOut: (timeAtCursor?: number | undefined) => void
  onZoomReset: () => void
  onZoomInCustom: (mouseStartX: number, mouseEndX: number) => void
  onZoomInCustomInProgress: (mouseStartX: number, mouseEndX: number) => void
} => {
  const { currentZoomScale, nextSmallerZoomScale, nextBiggerZoomScale } = useZoomLevels(domain, zoomLevels)

  const zoomWidth = zoomScaleWidth(nextSmallerZoomScale)
  const currentDomainWidth = domain[1] - domain[0]
  const maxDomainWidth = maxDomainEnd - maxDomainStart

  const isZoomInPossible = nextSmallerZoomScale !== 'minimum'
  const isZoomOutPossible = currentDomainWidth < maxDomainWidth

  const setDomainAnimated = (newDomain: Domain) => onDomainChange(newDomain, true)

  const updateDomain = (zoomScale: ZoomScale) => (timeAtCursor?: number) => {
    if (isDomainChangePossible) {
      const newZoomWidth = zoomScaleWidth(zoomScale)
      setDomainAnimated(
        getDomainSpan(maxDomainStart, maxDomainEnd, timeAtCursor ?? (domain[0] + domain[1]) / 2, newZoomWidth)
      )
    }
  }

  const onZoomIn = updateDomain(nextSmallerZoomScale)
  const onZoomOut = updateDomain(nextBiggerZoomScale)

  const onZoomInCustom = (mouseStartX: number, mouseEndX: number) => {
    if (isDomainChangePossible) {
      const newMin = timeScale.invert(mouseStartX)
      const newMax = timeScale.invert(mouseEndX)
      setDomainAnimated([newMin, newMax])
    }
  }

  const onZoomInCustomInProgress = (mouseStartX: number, mouseEndX: number) => {
    if (isDomainChangePossible && onCursorMove) {
      const newMin = timeScale.invert(mouseStartX)
      const newMax = timeScale.invert(mouseEndX)
      onCursorMove(newMax, newMin, newMax)
    }
  }

  const onZoomReset = () => {
    if (isDomainChangePossible) {
      setDomainAnimated([maxDomainStart, maxDomainEnd])
    }
  }

  return {
    currentZoomScale,
    zoomWidth,
    nextSmallerZoomScale,
    nextBiggerZoomScale,
    isZoomInPossible,
    isZoomOutPossible,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onZoomInCustom,
    onZoomInCustomInProgress,
  }
}
