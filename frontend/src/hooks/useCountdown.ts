import { useState, useEffect } from 'react'
import { differenceInSeconds, isPast } from 'date-fns'

interface CountdownResult {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
  totalSeconds: number
  label: string
  urgency: 'normal' | 'warning' | 'critical'
}

export function useCountdown(endsAt: string): CountdownResult {
  const calcRemaining = () => {
    const end = new Date(endsAt)
    if (isPast(end)) return 0
    return differenceInSeconds(end, new Date())
  }

  const [totalSeconds, setTotalSeconds] = useState(calcRemaining)

  useEffect(() => {
    const tick = () => setTotalSeconds(calcRemaining())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endsAt]) // eslint-disable-line react-hooks/exhaustive-deps

  const isExpired = totalSeconds <= 0
  const days    = Math.floor(totalSeconds / 86400)
  const hours   = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  let label: string
  if (isExpired) {
    label = 'Ended'
  } else if (days > 0) {
    label = `${days}d ${hours}h`
  } else if (hours > 0) {
    label = `${hours}h ${minutes}m`
  } else {
    label = `${minutes}m ${seconds}s`
  }

  const urgency =
    isExpired ? 'critical'
    : totalSeconds < 300 ? 'critical'   // < 5 min
    : totalSeconds < 3600 ? 'warning'   // < 1 hr
    : 'normal'

  return { days, hours, minutes, seconds, isExpired, totalSeconds, label, urgency }
}
