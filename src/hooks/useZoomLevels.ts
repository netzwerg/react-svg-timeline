import { Domain } from '../model'
import { currentZoomScale, nextBiggerZoomScale, nextSmallerZoomScale, ZoomLevels, zoomScaleWidth } from '../ZoomScale'

export function useZoomLevels(
  domain: Domain,
  zoomLevels: ReadonlyArray<ZoomLevels>
): [ZoomLevels, ZoomLevels, ZoomLevels] {
  const orderedZoomLevels = [...zoomLevels].sort((a, b) => zoomScaleWidth(b) - zoomScaleWidth(a))

  return [
    currentZoomScale(domain, orderedZoomLevels),
    nextSmallerZoomScale(domain, orderedZoomLevels),
    nextBiggerZoomScale(domain, orderedZoomLevels),
  ]
}
