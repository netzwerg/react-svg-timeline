import { ScaleLinear } from 'd3-scale'
import { useCallback, useEffect } from 'react'
import { Domain } from '../model'
import { clamp } from '../utils'

export function useTrimming(
  maxDomain: Domain,
  timeScale: ScaleLinear<number, number>,
  onTrimRangeChange?: (startMillis: number, endMillis: number) => void,
  trimRange?: Domain
): [(mousePosX: number) => void, (mousePosX: number) => void] {
  const onTrimStart = useCallback(
    (mousePosX: number) => {
      if (onTrimRangeChange) {
        onTrimRangeChange(timeScale.invert(mousePosX), trimRange ? trimRange[1] : maxDomain[1])
      }
    },
    [trimRange, maxDomain, onTrimRangeChange, timeScale]
  )

  const onTrimEnd = useCallback(
    (mousePosX: number) => {
      if (onTrimRangeChange) {
        onTrimRangeChange(trimRange ? trimRange[0] : maxDomain[0], timeScale.invert(mousePosX))
      }
    },
    [trimRange, maxDomain, onTrimRangeChange, timeScale]
  )

  /**
   * Always ensure that…
   * 1. Trim-Range is within MaxDomain-Range
   * 2. Trim-Start is < Trim-End
   * 3. Trim-End is > Trim-Start
   */
  useEffect(() => {
    if (onTrimRangeChange && trimRange) {
      const [start, end] = [
        clamp(trimRange[0], maxDomain[0], trimRange[1]),
        clamp(trimRange[1], trimRange[0], maxDomain[1]),
      ]

      if (start !== trimRange[0] || end !== trimRange[1]) {
        onTrimRangeChange(start, end)
      }
    }
  }, [maxDomain, trimRange, onTrimRangeChange])

  return [onTrimStart, onTrimEnd]
}
