import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'leaflet/dist/leaflet.css';
import App from './App.jsx'
import TawkToChat from './TawkToChat';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TawkToChat>
    
    </TawkToChat>
    <App />
  </StrictMode>,
)
