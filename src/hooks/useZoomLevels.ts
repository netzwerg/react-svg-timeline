import { Domain } from '../model'
import {
  currentZoomScale,
  nextBiggerZoomScale,
  nextSmallerZoomScale,
  ZoomLevels,
  zoomScaleWidth,
} from '../shared/ZoomScale'

export function useZoomLevels(
  domain: Domain,
  zoomLevels: ReadonlyArray<ZoomLevels>
): { currentZoomScale: ZoomLevels; nextSmallerZoomScale: ZoomLevels; nextBiggerZoomScale: ZoomLevels } {
  const orderedZoomLevels = [...zoomLevels].sort((a, b) => zoomScaleWidth(b) - zoomScaleWidth(a))

  return {
    currentZoomScale: currentZoomScale(domain, orderedZoomLevels),
    nextSmallerZoomScale: nextSmallerZoomScale(domain, orderedZoomLevels),
    nextBiggerZoomScale: nextBiggerZoomScale(domain, orderedZoomLevels),
  }
}
