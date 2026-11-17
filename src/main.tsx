import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';
import ResizeObserver from 'resize-observer-polyfill';
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = ResizeObserver;
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initUserStorageAutoSave } from './services/userStorage.ts'

// Ensure automatic cross-store changes sync to active user storage immediately
initUserStorageAutoSave();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
