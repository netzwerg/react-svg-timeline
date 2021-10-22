import { ScaleLinear } from 'd3-scale'
import { useZoomLevels } from '.'
import { Domain, getDomainSpan, ZoomLevels, ZoomScale, zoomScaleWidth } from '..'

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
}: UseZoomProps): [
  ZoomLevels,
  number,
  ZoomLevels,
  ZoomLevels,
  boolean,
  boolean,
  (timeAtCursor?: number | undefined) => void,
  (timeAtCursor?: number | undefined) => void,
  () => void,
  (mouseStartX: number, mouseEndX: number) => void,
  (mouseStartX: number, mouseEndX: number) => void
] => {
  const [zoomScale, smallerZoomScale, biggerZoomScale] = useZoomLevels(domain, zoomLevels)

  const zoomWidth = zoomScaleWidth(smallerZoomScale)
  const currentDomainWidth = domain[1] - domain[0]
  const maxDomainWidth = maxDomainEnd - maxDomainStart

  const isZoomInPossible = smallerZoomScale !== 'minimum'
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

  const onZoomIn = updateDomain(smallerZoomScale)
  const onZoomOut = updateDomain(biggerZoomScale)

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

  return [
    zoomScale,
    zoomWidth,
    smallerZoomScale,
    biggerZoomScale,
    isZoomInPossible,
    isZoomOutPossible,
    onZoomIn,
    onZoomOut,
    onZoomReset,
    onZoomInCustom,
    onZoomInCustomInProgress,
  ]
}
