import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { App } from './App'
import { Presentation } from './presentation/Presentation'
import { PointerEffects } from './components/PointerEffects'

export function render(path = '/'): string {
  return renderToString(
    <StrictMode>
      <App path={path} />
    </StrictMode>,
  )
}

export { products } from './data/products'
export { collections } from './data/collections'

export function renderPresentation(): string {
  return renderToString(
    <StrictMode>
      <Presentation />
      <PointerEffects />
    </StrictMode>,
  )
}
