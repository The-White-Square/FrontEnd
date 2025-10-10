/**
 * Main App Component
 * 
 * This is the root component of the Co-opy drawing game application.
 * It sets up routing between the home page and drawing game pages,
 * with code splitting for performance optimization.
 */

import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Lazy load components to reduce initial bundle size
// This means components are only loaded when the user navigates to them
const Home = lazy(() => import('./Home'))           // Landing page with room creation/joining
const DrawingPage = lazy(() => import('./DrawingPage'))  // Main drawing game interface

function App() {
    return (
        <div className='App'>
            {/* Browser Router enables client-side routing */}
            <BrowserRouter>
                {/* Suspense handles loading states for lazy-loaded components */}
                <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                        {/* Home page route - landing page */}
                        <Route path="/" element={<Home />} />
                        
                        {/* Drawing game route - includes room code parameter */}
                        <Route path="/game/:roomCode" element={<DrawingPage />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
        </div>
    )
}

export default App
