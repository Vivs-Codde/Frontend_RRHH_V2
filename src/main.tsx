import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n' // Importar configuración de i18n
import App from './App'
import GoogleMapsProvider from './context/GoogleMapsContext'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <GoogleMapsProvider>
      <App />
    </GoogleMapsProvider>
  </StrictMode>,
)
