import { useState, useEffect } from 'react'
import { VisibleObserve } from './AVisibleObserve'

export function useActive(domId: string) {
  const [active, setActive] = useState(false)
  useEffect(() => {
    const visibleObserve = new VisibleObserve(domId, setActive as any)
    visibleObserve.observe()
    return () => visibleObserve.unObserve()
  }, [domId])
  return active
}
