import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource-variable/bodoni-moda/opsz.css'
import '@fontsource/cormorant-garamond/400.css'
import '@fontsource/cormorant-garamond/400-italic.css'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource-variable/manrope'
import './styles/index.css'
import { App } from './App'

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <App path={window.location.pathname} />
  </StrictMode>
)

// in produzione l'HTML è già prerenderizzato: React lo "idrata";
// in sviluppo il contenitore è vuoto e si renderizza da zero
if (container.hasChildNodes()) hydrateRoot(container, app)
else createRoot(container).render(app)
