/**
 * Main App Component
 * Created by Gabriel
 * 
 * Root component with routing and authentication provider.
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Learn from './pages/Learn';
import './styles/globals.css';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/learn" element={<Learn />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;

