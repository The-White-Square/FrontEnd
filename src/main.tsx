/**
 * Main Entry Point
 * 
 * This is the entry point for the Co-opy drawing game React application.
 * It sets up the root React component and renders it into the DOM.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'  // Global CSS styles
import App from './App'  // Main App component

// Get the root DOM element where React will render the app
const rootElement = document.getElementById('root')!

// Create React root and render the app
// StrictMode helps catch common bugs and deprecated features during development
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
