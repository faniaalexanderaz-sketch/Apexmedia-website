import { useEffect, useState } from 'react'
import { openStatus, type OpenStatus } from '../lib/hours'

/** Stato aperto/chiuso calcolato solo nel browser (l'HTML prerenderizzato non conosce l'ora). */
export function useOpenStatus(): OpenStatus | null {
  const [status, setStatus] = useState<OpenStatus | null>(null)
  useEffect(() => {
    const update = () => setStatus(openStatus())
    update()
    const id = window.setInterval(update, 60_000)
    return () => window.clearInterval(id)
  }, [])
  return status
}
