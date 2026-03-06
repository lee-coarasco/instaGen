import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ProjectProvider } from '@contexts/ProjectContext'
import { AuthProvider } from '@contexts/AuthContext'
import HomePage from '@components/pages/HomePage'
import CreatePage from '@components/pages/CreatePage'
import DashboardPage from '@components/pages/DashboardPage'
import GalleryPage from '@components/pages/GalleryPage'
import SettingsPage from '@components/pages/SettingsPage'
import Navbar from '@components/common/Navbar'
import ProtectedRoute from '@components/auth/ProtectedRoute'
import './App.css'

function App() {
    return (
        <AuthProvider>
            <ProjectProvider>
                <Router>
                    <div className="app">
                        <Navbar />
                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/create" element={
                                    <ProtectedRoute>
                                        <CreatePage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/create/:stage" element={
                                    <ProtectedRoute>
                                        <CreatePage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/create/:stage/:id" element={
                                    <ProtectedRoute>
                                        <CreatePage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/dashboard" element={
                                    <ProtectedRoute>
                                        <DashboardPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/gallery" element={
                                    <ProtectedRoute>
                                        <GalleryPage />
                                    </ProtectedRoute>
                                } />
                                <Route path="/settings" element={
                                    <ProtectedRoute>
                                        <SettingsPage />
                                    </ProtectedRoute>
                                } />
                            </Routes>
                        </main>
                    </div>
                </Router>
            </ProjectProvider>
        </AuthProvider>
    )
}

export default App
