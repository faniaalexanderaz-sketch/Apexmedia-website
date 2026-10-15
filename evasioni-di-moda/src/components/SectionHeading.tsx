import type { ReactNode } from 'react'

type Props = {
  /** numero editoriale della sezione, es. 1 → "01" */
  index: number
  label: string
  title: ReactNode
  id: string
  intro?: ReactNode
  className?: string
}

/** Intestazione editoriale condivisa: numerazione, etichetta, titolo grande, sottotitolo. */
export function SectionHeading({ index, label, title, id, intro, className = '' }: Props) {
  return (
    <header className={`section-heading ${className}`}>
      <p className="section-heading__meta" data-reveal="fade">
        <span className="section-heading__index" data-count={index}>
          {String(index).padStart(2, '0')}
        </span>
        <span className="section-heading__rule" aria-hidden="true" />
        <span className="eyebrow">{label}</span>
      </p>
      <h2 id={id} className="section-heading__title" data-reveal="title">
        {title}
      </h2>
      {intro && (
        <p className="section-heading__intro" data-reveal="fade" data-delay="0.2">
          {intro}
        </p>
      )}
    </header>
  )
}
