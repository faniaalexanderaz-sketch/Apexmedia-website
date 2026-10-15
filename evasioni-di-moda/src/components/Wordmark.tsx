type Props = { className?: string }

/** Logo tipografico: EVASIONI di MODA */
export function Wordmark({ className = '' }: Props) {
  return (
    <span className={`wordmark ${className}`}>
      <span className="wordmark__mask">
        <span className="wordmark__word">Evasioni</span>
      </span>
      <span className="wordmark__mask">
        <span className="wordmark__di">di</span>
      </span>
      <span className="wordmark__mask">
        <span className="wordmark__word">Moda</span>
      </span>
    </span>
  )
}
