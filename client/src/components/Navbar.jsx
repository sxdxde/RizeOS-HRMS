import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { connectWallet, getWalletAddress, isMetaMaskInstalled } from '../services/web3'
import { LayoutDashboard, Users, CheckSquare, BrainCircuit, LogOut, Wallet } from 'lucide-react'

const NAV = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employees', label: 'Employees', icon: Users },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/ai', label: 'AI Insights', icon: BrainCircuit },
]

export default function Navbar() {
    const location = useLocation()
    const navigate = useNavigate()
    const [walletAddress, setWalletAddress] = useState(null)
    const [connecting, setConnecting] = useState(false)
    const org = JSON.parse(localStorage.getItem('hrms_org') || '{}')

    useEffect(() => { getWalletAddress().then(setWalletAddress) }, [])

    const handleConnect = async () => {
        try {
            setConnecting(true)
            const { address } = await connectWallet()
            setWalletAddress(address)
        } catch (err) { alert(err.message) }
        finally { setConnecting(false) }
    }

    const handleLogout = () => {
        localStorage.removeItem('hrms_token')
        localStorage.removeItem('hrms_org')
        navigate('/login')
    }

    const short = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : ''

    return (
        <nav style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-default)' }}
            className="sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-5 flex items-center justify-between h-[60px] gap-6">

                {/* Logo */}
                <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
                    <div style={{
                        background: 'var(--accent-blue)',
                        borderRadius: '10px',
                        width: 32, height: 32,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.75rem', color: '#fff', letterSpacing: '-0.03em'
                    }}>AI</div>
                    <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                        HRMS
                    </span>
                </Link>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-1 flex-1">
                    {NAV.map(({ to, label, icon: Icon }) => {
                        const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
                        return (
                            <Link key={to} to={to} style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.4rem 0.85rem',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                fontWeight: active ? 700 : 500,
                                color: active ? '#fff' : 'var(--text-secondary)',
                                background: active ? 'var(--accent-blue)' : 'transparent',
                                transition: 'all 0.15s ease',
                                letterSpacing: '-0.01em',
                            }}
                                onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-primary)' }}
                                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)' }}
                            >
                                <Icon size={14} />
                                {label}
                            </Link>
                        )
                    })}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2.5 shrink-0">
                    {/* Wallet */}
                    {walletAddress ? (
                        <button onClick={() => setWalletAddress(null)} title="Disconnect Wallet" style={{
                            display: 'flex', alignItems: 'center', gap: '0.45rem',
                            background: 'rgba(43,222,142,0.1)', border: '1px solid rgba(43,222,142,0.25)',
                            color: '#2bde8e', padding: '0.35rem 0.8rem', borderRadius: '8px',
                            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(43,222,142,0.18)'; e.currentTarget.style.borderColor = 'rgba(43,222,142,0.4)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(43,222,142,0.1)'; e.currentTarget.style.borderColor = 'rgba(43,222,142,0.25)' }}
                        >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2bde8e', animation: 'pulse-dot 2s infinite' }} />
                            {short(walletAddress)}
                        </button>
                    ) : (
                        <button onClick={handleConnect} disabled={connecting || !isMetaMaskInstalled()}
                            className="btn btn-ghost btn-sm"
                            style={{ gap: '0.4rem' }}>
                            <Wallet size={13} />
                            {connecting ? 'Connecting…' : 'Connect MetaMask'}
                        </button>
                    )}

                    {/* Org avatar */}
                    <div style={{
                        width: 32, height: 32, borderRadius: '8px',
                        background: 'var(--accent-blue)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.78rem', fontWeight: 800, color: '#fff'
                    }}>
                        {org?.name?.charAt(0)?.toUpperCase() || 'O'}
                    </div>

                    {/* Logout */}
                    <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ gap: '0.4rem', color: 'var(--text-muted)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-red)'; e.currentTarget.style.borderColor = 'rgba(255,68,102,0.3)'; e.currentTarget.style.background = 'rgba(255,68,102,0.1)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                    >
                        <LogOut size={13} />
                        <span className="hidden sm:inline">Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Mobile nav */}
            <div className="md:hidden flex gap-1 px-4 pb-2 overflow-x-auto">
                {NAV.map(({ to, label, icon: Icon }) => {
                    const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
                    return (
                        <Link key={to} to={to} style={{
                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                            padding: '0.4rem 0.75rem', borderRadius: '8px',
                            fontSize: '0.78rem', fontWeight: active ? 700 : 500,
                            color: active ? '#fff' : 'var(--text-secondary)',
                            background: active ? 'var(--accent-blue)' : 'transparent',
                            whiteSpace: 'nowrap', transition: 'all 0.15s',
                        }}>
                            <Icon size={13} />{label}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
