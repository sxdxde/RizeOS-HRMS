import React, { useState, useEffect } from 'react'
import { getInsights, getSmartAssign } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import StatCard from '../components/StatCard'
import { BrainCircuit, Trophy, AlertCircle, ArrowRight, Wand2, Target } from 'lucide-react'

export default function AIInsights() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [taskDesc, setTaskDesc] = useState('')
    const [assignResults, setAssignResults] = useState(null)
    const [assignLoading, setAssignLoading] = useState(false)

    useEffect(() => {
        getInsights()
            .then(res => setData(res.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const handleSmartAssign = async (e) => {
        e.preventDefault(); if (!taskDesc.trim()) return
        setAssignLoading(true)
        try {
            const res = await getSmartAssign('New Task', taskDesc)
            setAssignResults(res.data)

        } catch { alert('Smart assignment failed') }
        finally { setAssignLoading(false) }
    }

    if (loading) return <LoadingSpinner text="Generating AI insights…" />
    if (!data) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No data available</div>

    const scoreColor = (score) => score >= 80 ? 'var(--accent-green)' : score >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)'

    return (
        <div className="animate-fadeUp" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div>
                <p className="eyebrow" style={{ marginBottom: '0.35rem', color: 'var(--accent-purple)' }}>Powered by AI</p>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    Insights <BrainCircuit size={24} color="var(--accent-purple)" />
                </h1>
            </div>

            {/* Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }} className="stagger">
                <div style={{
                    background: 'var(--accent-purple)', borderRadius: '20px', padding: '1.5rem',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', right: '-1rem', top: '-1rem', opacity: 0.1, transform: 'rotate(15deg)' }}>
                        <BrainCircuit size={140} />
                    </div>
                    <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.6)', marginBottom: '0.5rem' }}>
                        Org Average Score
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '3.5rem', fontWeight: 900, color: '#111', letterSpacing: '-0.05em', lineHeight: 1 }}>
                            {data.averageScore}
                        </span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'rgba(0,0,0,0.5)' }}>/100</span>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '20px', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Trophy size={16} color="var(--accent-green)" /> High Performers
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {data.highPerformers?.length ? data.highPerformers.map((emp, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{emp.name}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.role}</p>
                                </div>
                                <span style={{ fontWeight: 800, color: 'var(--accent-green)', fontSize: '0.9rem' }}>{emp.score}</span>
                            </div>
                        )) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No data</p>}
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '20px', padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <AlertCircle size={16} color="var(--accent-red)" /> Needs Attention
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {data.needsAttention?.length ? data.needsAttention.map((emp, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{emp.name}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.role}</p>
                                </div>
                                <span style={{ fontWeight: 800, color: 'var(--accent-red)', fontSize: '0.9rem' }}>{emp.score}</span>
                            </div>
                        )) : <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No data</p>}
                    </div>
                </div>
            </div>

            {/* Smart Task Assignment Tool */}
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                borderRadius: '20px', padding: '1.5rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '10px', background: 'rgba(61,49,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-blue)' }}>
                        <Wand2 size={16} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Smart Assignment</h2>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI matching across your org's skills</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', md: { gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr' } }}>
                    <form onSubmit={handleSmartAssign} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <textarea className="field" placeholder="Describe the task (e.g. 'Build a React and Node.js dashboard backend')"
                            style={{ height: 110, resize: 'none' }}
                            value={taskDesc} onChange={e => setTaskDesc(e.target.value)} required />
                        <button type="submit" disabled={assignLoading} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                            {assignLoading ? <LoadingSpinner size="sm" text="" /> : <Target size={14} />}
                            {assignLoading ? 'Analyzing…' : 'Find Best Match'}
                        </button>
                    </form>

                    {/* Results */}
                    {assignResults && (
                        <div className="animate-fadeIn" style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-strong)',
                            borderRadius: '14px', padding: '1.25rem',
                        }}>
                            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)' }}>Top Recommendations:</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                {assignResults.recommendations.map((rec, i) => (
                                    <div key={i} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        background: 'var(--bg-base)', padding: '0.85rem 1rem', borderRadius: '10px',
                                        border: i === 0 ? '1px solid var(--accent-blue)' : '1px solid var(--border-default)',
                                    }}>
                                        <div>
                                            <p style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {rec.employee.name}
                                                {i === 0 && <span className="tag tag-blue" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>Best Match</span>}
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{rec.employee.role}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-blue)', letterSpacing: '-0.03em' }}>
                                                {rec.matchScore}%
                                            </span>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>match</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Dept Breakdown */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '20px', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Department Performance</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                    {data.departmentScores?.map(dept => (
                        <div key={dept.department} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{dept.department}</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: scoreColor(dept.avgScore) }}>{Math.round(dept.avgScore)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
