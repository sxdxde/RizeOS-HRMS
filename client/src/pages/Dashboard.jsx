import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../services/api'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import { Users, CheckCircle, Clock, Zap, Target } from 'lucide-react'

export default function Dashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchData = useCallback(async () => {
        try {
            const res = await getDashboard()
            setData(res.data)
            setError('')
        } catch { setError('Failed to load dashboard') }
        finally { setLoading(false) }
    }, [])

    useEffect(() => {
        fetchData()
        const iv = setInterval(fetchData, 30000)
        return () => clearInterval(iv)
    }, [fetchData])

    if (loading) return <LoadingSpinner text="Loading dashboard…" />
    if (error && !data) return <div style={{ color: 'var(--accent-red)', textAlign: 'center', padding: '3rem' }}>{error}</div>

    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'

    return (
        <div className="animate-fadeUp" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Page header */}
            <div>
                <p className="eyebrow" style={{ marginBottom: '0.35rem' }}>Overview</p>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em' }}>Dashboard</h1>
            </div>

            {/* Bento stat grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.85rem' }}
                className="stagger">
                <StatCard title="Employees" value={data?.totalEmployees} icon={<Users size={16} />} accent="blue" />
                <StatCard title="Active" value={data?.activeEmployees} icon={<CheckCircle size={16} />} accent="default" />
                <StatCard title="Assigned" value={data?.assignedTasks} icon={<Target size={16} />} accent="default" />
                <StatCard title="In Progress" value={data?.inProgressTasks} icon={<Clock size={16} />} accent="yellow" />
                <StatCard title="Completed" value={data?.completedTasks} icon={<Zap size={16} />} accent="green" />
            </div>

            {/* Bottom grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                    {/* Recent Tasks */}
                    <div style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                        borderRadius: '20px', padding: '1.5rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <div>
                                <p className="eyebrow" style={{ marginBottom: '0.2rem' }}>Latest</p>
                                <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Recent Tasks</h2>
                            </div>
                            <Link to="/tasks" style={{
                                fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)',
                                border: '1px solid var(--border-default)', borderRadius: '8px',
                                padding: '0.35rem 0.75rem', transition: 'all 0.15s',
                            }}>View all</Link>
                        </div>

                        {!data?.recentTasks?.length ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', fontSize: '0.875rem' }}>No tasks yet</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                {data.recentTasks.map((task, i) => (
                                    <div key={task.id} style={{
                                        display: 'flex', alignItems: 'center',
                                        gap: '1rem', padding: '0.85rem 0',
                                        borderBottom: i < data.recentTasks.length - 1 ? '1px solid var(--border-default)' : 'none',
                                    }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {task.title}
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                                {task.employee?.name || '—'}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                                            <StatusBadge status={task.status} />
                                            <PriorityBadge priority={task.priority} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Performers */}
                <div style={{
                    background: 'var(--accent-blue)', borderRadius: '20px', padding: '1.5rem',
                    position: 'relative', overflow: 'hidden',
                }}>
                    {/* Decorative shapes */}
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', width: 60, height: 60, background: 'rgba(255,255,255,0.1)', borderRadius: '12px', transform: 'rotate(20deg)' }} />
                    <div style={{ position: 'absolute', bottom: '1rem', right: '3.5rem', width: 35, height: 35, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />

                    <div style={{ marginBottom: '1.25rem' }}>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
                            Top performers
                        </p>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', marginTop: '0.2rem' }}>
                            Leaders this cycle
                        </h2>
                    </div>

                    {!data?.topPerformers?.length ? (
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>No data yet</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {data.topPerformers.map((emp, i) => (
                                <Link key={emp.id} to={`/employees/${emp.id}`} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    background: 'rgba(255,255,255,0.1)', borderRadius: '12px',
                                    padding: '0.65rem 0.85rem', transition: 'background 0.15s',
                                    textDecoration: 'none',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                >
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '8px', flexShrink: 0,
                                        background: i === 0 ? 'var(--accent-yellow)' : i === 1 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.72rem', fontWeight: 800,
                                        color: i === 0 ? '#111' : '#fff',
                                    }}>{i + 1}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {emp.name}
                                        </p>
                                        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>{emp.role}</p>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'rgba(255,255,255,0.8)' }}>
                                        {emp.completedTasks} done
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    <Link to="/employees" style={{
                        display: 'block', marginTop: '1rem', fontSize: '0.78rem', fontWeight: 600,
                        color: 'rgba(255,255,255,0.65)', textAlign: 'center',
                    }}>View all employees</Link>
                </div>
            </div>
        </div>
    )
}
