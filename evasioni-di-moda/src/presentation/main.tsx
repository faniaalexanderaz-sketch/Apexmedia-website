import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/bodoni-moda/opsz.css'
import '@fontsource/cormorant-garamond/400.css'
import '@fontsource/cormorant-garamond/400-italic.css'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource-variable/manrope'
import '../styles/index.css'
import './presentation.css'
import { Presentation } from './Presentation'
import { PointerEffects } from '../components/PointerEffects'

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <Presentation />
    <PointerEffects />
  </StrictMode>
)

if (container.hasChildNodes()) hydrateRoot(container, app)
else createRoot(container).render(app)
