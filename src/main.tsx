import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { M3Provider } from 'm3r';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <M3Provider themeColor="#ff0000" themeMode="light"> 
    <App />
    </M3Provider>
  </StrictMode>,
)
