import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { connectWallet, getWalletAddress, isMetaMaskInstalled } from '../services/web3'
import { LayoutDashboard, Users, CheckSquare, BrainCircuit, Wallet, LogOut } from 'lucide-react'

export default function Navbar() {
    const location = useLocation()
    const navigate = useNavigate()
    const [walletAddress, setWalletAddress] = useState(null)
    const [connecting, setConnecting] = useState(false)
    const org = JSON.parse(localStorage.getItem('hrms_org') || '{}')

    useEffect(() => {
        getWalletAddress().then(setWalletAddress)
    }, [])

    const handleConnect = async () => {
        try {
            setConnecting(true)
            const { address } = await connectWallet()
            setWalletAddress(address)
        } catch (err) {
            alert(err.message)
        } finally {
            setConnecting(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('hrms_token')
        localStorage.removeItem('hrms_org')
        navigate('/login')
    }

    const truncateAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''

    const navLinks = [
        { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { to: '/employees', label: 'Employees', icon: <Users className="w-4 h-4" /> },
        { to: '/tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
        { to: '/ai', label: 'AI Insights', icon: <BrainCircuit className="w-4 h-4" /> },
    ]

    return (
        <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-sm border border-indigo-500/30 group-hover:bg-indigo-500/30 transition-colors">
                            AI
                        </div>
                        <span className="font-bold text-lg tracking-wide group-hover:text-indigo-400 transition-colors">AI-HRMS</span>
                    </Link>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(({ to, label, icon }) => {
                            const isActive = location.pathname === to ||
                                (to !== '/dashboard' && location.pathname.startsWith(to))
                            return (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}
                                >
                                    <span>{icon}</span>
                                    {label}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {/* Wallet */}
                        {walletAddress ? (
                            <div className="flex items-center gap-2 bg-green-900/30 border border-green-700/50 text-green-400 px-3 py-1.5 rounded-lg text-sm">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                {truncateAddress(walletAddress)}
                            </div>
                        ) : (
                            <button
                                onClick={handleConnect}
                                disabled={connecting || !isMetaMaskInstalled()}
                                className="flex items-center gap-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-gray-600 text-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                            >
                                <Wallet className="w-4 h-4" />
                                {connecting ? 'Connecting...' : 'Connect'}
                            </button>
                        )}

                        {/* Org name */}
                        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
                            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                                {org?.name?.charAt(0)?.toUpperCase() || 'O'}
                            </div>
                            <span className="max-w-[100px] truncate">{org?.name || 'Org'}</span>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Mobile nav */}
                <div className="md:hidden flex gap-3 pb-3 overflow-x-auto">
                    {navLinks.map(({ to, label, icon }) => {
                        const isActive = location.pathname === to ||
                            (to !== '/dashboard' && location.pathname.startsWith(to))
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {icon} {label}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
