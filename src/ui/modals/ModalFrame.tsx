import type { ReactNode } from 'react'
import { closeCastle } from '../../game/commands.ts'

export function ModalFrame({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <header className="modal-head">
        <div>
          <p>{subtitle}</p>
          <h2>{title}</h2>
        </div>
        <button type="button" className="game-btn tiny" onClick={closeCastle}>
          Close
        </button>
      </header>
      <div className="modal-body">{children}</div>
    </section>
  )
}

export function TechList({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="muted">Add items in portfolioData.ts</p>
  return (
    <ul className="stack">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export function OutLink({ href, label }: { href: string; label: string }) {
  if (!href.trim()) {
    return (
      <button type="button" className="game-btn" disabled>
        {label}
      </button>
    )
  }
  return (
    <a className="game-btn" href={href} target="_blank" rel="noreferrer">
      {label}
    </a>
  )
}
