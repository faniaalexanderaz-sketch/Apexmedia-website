import { useOpenStatus } from '../hooks/useOpenStatus'

type Props = { className?: string }

/** Indicatore live "Aperto ora / Chiuso": dà un motivo in più per passare subito. */
export function OpenStatusBadge({ className = '' }: Props) {
  const status = useOpenStatus()
  if (!status) return null
  return (
    <span className={`open-status ${className}`} data-open={status.open || undefined}>
      <span className="open-status__dot" aria-hidden="true" />
      {status.label}
    </span>
  )
}
