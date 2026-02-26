import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/api'

export default function Register() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await register(form)
            localStorage.setItem('hrms_token', res.data.token)
            localStorage.setItem('hrms_org', JSON.stringify(res.data.org))
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.')
        } finally { setLoading(false) }
    }

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg-base)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
        }}>
            <div style={{ width: '100%', maxWidth: 440 }} className="animate-fadeUp">
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: '14px', background: 'var(--accent-blue)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: '1rem', color: '#fff', letterSpacing: '-0.04em',
                        margin: '0 auto 1.25rem',
                    }}>AI</div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
                        Create your workspace
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.4rem' }}>
                        Set up your AI-HRMS organization
                    </p>
                </div>

                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                    borderRadius: '20px', padding: '2rem',
                }}>
                    {error && (
                        <div style={{
                            background: 'rgba(255,68,102,0.1)', border: '1px solid rgba(255,68,102,0.25)',
                            color: 'var(--accent-red)', borderRadius: '10px',
                            padding: '0.75rem 1rem', fontSize: '0.83rem', marginBottom: '1.25rem',
                        }}>{error}</div>
                    )}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        <div>
                            <label className="field-label">Organization Name</label>
                            <input type="text" className="field" placeholder="TechCorp India"
                                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div>
                            <label className="field-label">Email address</label>
                            <input type="email" className="field" placeholder="admin@company.com"
                                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>
                        <div>
                            <label className="field-label">Password</label>
                            <input type="password" className="field" placeholder="••••••••"
                                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                        </div>
                        <button type="submit" disabled={loading} className="btn btn-primary"
                            style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem' }}>
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                                    Creating…
                                </span>
                            ) : 'Register Organization'}
                        </button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
