import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import EmployeeDetail from './pages/EmployeeDetail'
import Tasks from './pages/Tasks'
import AIInsights from './pages/AIInsights'
import Navbar from './components/Navbar'

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('hrms_token')
    if (!token) return <Navigate to="/login" replace />
    return children
}

function Layout({ children }) {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.25rem' }}>
                {children}
            </main>
        </div>
    )
}

export default function App() {
    const token = localStorage.getItem('hrms_token')

    return (
        <Routes>
            <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><Layout><Employees /></Layout></ProtectedRoute>} />
            <Route path="/employees/:id" element={<ProtectedRoute><Layout><EmployeeDetail /></Layout></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Layout><Tasks /></Layout></ProtectedRoute>} />
            <Route path="/ai" element={<ProtectedRoute><Layout><AIInsights /></Layout></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}
