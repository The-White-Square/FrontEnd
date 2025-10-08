import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import DrawingPage from './DrawingPage'

function App() {
    return (
        <div className='App'>
            {/* Router setup */}
            <BrowserRouter>
                <Routes>
                    {/* Home page */}
                    <Route path="/" element={<Home />} />
                    {/* Drawing game */}
                    <Route path="/game/:roomCode" element={<DrawingPage />} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
