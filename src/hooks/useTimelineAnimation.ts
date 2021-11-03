import { useEffect, useState } from 'react'

import { Domain } from '..'

type Animation =
  | 'none'
  | Readonly<{
      startMs: number
      fromDomain: Domain
      toDomain: Domain
    }>

const animationDuration = 1000

interface UseTimelineAnimationProps {
  setDomain: (domain: Domain) => void
  maxDomainStart: number
  maxDomainEnd: number
}

export const useTimelineAnimation = ({
  setDomain,
  maxDomainStart,
  maxDomainEnd,
}: UseTimelineAnimationProps): {
  isAnimationInProgress: boolean
  setAnimation: React.Dispatch<React.SetStateAction<Animation>>
} => {
  const [animation, setAnimation] = useState<Animation>('none')

  const now = Date.now()

  useEffect(() => {
    setAnimation('none')
  }, [maxDomainStart, maxDomainEnd])

  useEffect(() => {
    if (animation !== 'none') {
      const elapsed = now - animation.startMs
      if (elapsed < animationDuration) {
        const t = elapsed / animationDuration
        const deltaStart = t * (animation.toDomain[0] - animation.fromDomain[0])
        const deltaEnd = t * (animation.toDomain[1] - animation.fromDomain[1])

        const animatedDomain: Domain = [animation.fromDomain[0] + deltaStart, animation.fromDomain[1] + deltaEnd]
        requestAnimationFrame(() => {
          setDomain(animatedDomain)
          if (animatedDomain[0] === animation.toDomain[0] && animatedDomain[1] === animation.toDomain[1]) {
            setAnimation('none')
          }
        })
      } else {
        setDomain(animation.toDomain)
        setAnimation('none')
      }
    }
  }, [animation, now, setDomain])

  const isAnimationInProgress = animation !== 'none'

  return { isAnimationInProgress, setAnimation }
}
