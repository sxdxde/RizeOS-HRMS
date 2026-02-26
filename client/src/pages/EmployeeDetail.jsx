import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getEmployee, getProductivity, getSkillGap } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import ProductivityScore from '../components/ProductivityScore'
import LoadingSpinner from '../components/LoadingSpinner'
import { Check, X, ArrowLeft, ExternalLink } from 'lucide-react'

export default function EmployeeDetail() {
    const { id } = useParams()
    const [employee, setEmployee] = useState(null)
    const [productivity, setProductivity] = useState(null)
    const [skillGap, setSkillGap] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [empRes, prodRes, gapRes] = await Promise.all([
                    getEmployee(id),
                    getProductivity(id),
                    getSkillGap(id).catch(() => ({ data: null })), // handle if skill gap fails
                ])
                setEmployee(empRes.data)
                setProductivity(prodRes.data)
                setSkillGap(gapRes.data)
            } catch (err) { } finally { setLoading(false) }
        }
        fetchAll()
    }, [id])

    if (loading) return <LoadingSpinner text="Loading employee profile…" />
    if (!employee) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Employee not found</div>

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

    return (
        <div className="animate-fadeUp" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div>
                <Link to="/employees" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600,
                    marginBottom: '1rem', textDecoration: 'none', transition: 'color 0.15s'
                }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    <ArrowLeft size={14} /> Back to Employees
                </Link>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em' }}>{employee.name}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>{employee.role} · {employee.department}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', lg: { gridTemplateColumns: '320px 1fr' } }}>
                {/* Left Col: Profile Card */}
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                    borderRadius: '20px', padding: '1.5rem', alignSelf: 'start'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: '14px', background: 'var(--accent-blue)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.1rem', fontWeight: 800, color: '#fff', flexShrink: 0
                        }}>
                            {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {employee.name}
                            </h2>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {employee.email}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Role</span>
                            <span style={{ fontWeight: 500 }}>{employee.role}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Department</span>
                            <span style={{ fontWeight: 500 }}>{employee.department}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Status</span>
                            <span style={{
                                display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600,
                                color: employee.isActive ? 'var(--accent-green)' : 'var(--text-muted)'
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: employee.isActive ? 'var(--accent-green)' : 'var(--text-muted)' }} />
                                {employee.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Joined</span>
                            <span style={{ fontWeight: 500 }}>{formatDate(employee.createdAt)}</span>
                        </div>
                        {employee.walletAddress && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Wallet</span>
                                <span style={{ color: 'var(--accent-purple)', fontFamily: 'monospace', fontSize: '0.75rem', textAlign: 'right', wordBreak: 'break-all' }}>
                                    {employee.walletAddress.slice(0, 10)}…{employee.walletAddress.slice(-6)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-default)' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Skills
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {employee.skills?.length > 0 ? employee.skills.map(s => (
                                <span key={s} className="tag tag-blue">{s}</span>
                            )) : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No skills listed</span>}
                        </div>
                    </div>
                </div>

                {/* Right Col */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Productivity Score */}
                    {productivity && (
                        <ProductivityScore score={productivity.score} label={productivity.label} breakdown={productivity.breakdown} />
                    )}

                    {/* Skill Gap */}
                    {skillGap && (
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '20px', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Skill Gap Analysis</h3>
                                <span style={{
                                    fontSize: '0.8rem', fontWeight: 800,
                                    color: skillGap.matchPercent >= 80 ? 'var(--accent-green)' : skillGap.matchPercent >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)'
                                }}>{skillGap.matchPercent}% match</span>
                            </div>

                            {/* Progress bar */}
                            <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: '99px', marginBottom: '1.25rem', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', borderRadius: '99px', transition: 'width 0.8s ease',
                                    width: `${skillGap.matchPercent}%`,
                                    background: skillGap.matchPercent >= 80 ? 'var(--accent-green)' : skillGap.matchPercent >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)'
                                }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.25rem' }}>
                                <div>
                                    <p className="eyebrow" style={{ marginBottom: '0.6rem' }}>Required Skills</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                        {skillGap.required.map(skill => {
                                            const isMissing = skillGap.missing.includes(skill)
                                            return (
                                                <span key={skill} className={`tag ${isMissing ? 'tag-red' : 'tag-green'}`}>
                                                    {isMissing ? <X size={10} /> : <Check size={10} />} {skill}
                                                </span>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <p className="eyebrow" style={{ marginBottom: '0.6rem' }}>Missing Skills</p>
                                    {skillGap.missing.length === 0 ? (
                                        <p style={{ color: 'var(--accent-green)', fontSize: '0.8rem', fontWeight: 600 }}>All skills matched!</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                            {skillGap.missing.map(skill => (
                                                <span key={skill} className="tag tag-red">{skill}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Task History */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '20px', padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Task History ({employee.tasks?.length || 0})</h2>

                {!employee.tasks?.length ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No tasks assigned yet</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-strong)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Title</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Status</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Priority</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employee.tasks.map(task => (
                                    <tr key={task.id} style={{ borderBottom: '1px solid var(--border-default)', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '0.85rem 1rem' }}>
                                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</span>
                                            {task.txHash && (
                                                <a href={`https://mumbai.polygonscan.com/tx/${task.txHash}`} target="_blank" rel="noopener noreferrer"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginLeft: '0.5rem', fontSize: '0.7rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
                                                    <ExternalLink size={10} /> Chain
                                                </a>
                                            )}
                                        </td>
                                        <td style={{ padding: '0.85rem 1rem' }}><StatusBadge status={task.status} /></td>
                                        <td style={{ padding: '0.85rem 1rem' }}><PriorityBadge priority={task.priority} /></td>
                                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
