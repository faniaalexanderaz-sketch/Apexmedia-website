import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { App } from './App'
import { Presentation } from './presentation/Presentation'
import { PointerEffects } from './components/PointerEffects'

export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

export function renderPresentation(): string {
  return renderToString(
    <StrictMode>
      <Presentation />
      <PointerEffects />
    </StrictMode>,
  )
}
