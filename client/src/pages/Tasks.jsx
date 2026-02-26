import React, { useState, useEffect } from 'react'
import { getTasks, createTask, updateTaskStatus, deleteTask, getEmployees } from '../services/api'
import { logTaskOnChain } from '../services/web3'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import { CheckCircle2, CircleDashed, Clock, User, Calendar, ExternalLink, ArrowRight, Plus, X } from 'lucide-react'

const STATUSES = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED']
const STATUS_LABELS = { ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' }
const STATUS_ICONS = {
    ASSIGNED: <CircleDashed size={14} />,
    IN_PROGRESS: <Clock size={14} />,
    COMPLETED: <CheckCircle2 size={14} />,
}
const COL_ACCENT = {
    ASSIGNED: { color: 'var(--accent-blue)', alpha: 'rgba(61,49,255,' },
    IN_PROGRESS: { color: '#f5e642', alpha: 'rgba(245,230,66,' },
    COMPLETED: { color: 'var(--accent-green)', alpha: 'rgba(43,222,142,' },
}

const EMPTY_FORM = { title: '', description: '', employeeId: '', priority: 'medium', dueDate: '' }

export default function Tasks() {
    const [tasks, setTasks] = useState([])
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [submitting, setSubmitting] = useState(false)
    const [chainLoading, setChainLoading] = useState({})
    const [toast, setToast] = useState(null)
    const [filterEmployee, setFilterEmployee] = useState('')

    const fetchAll = async () => {
        try {
            const [tasksRes, empsRes] = await Promise.all([getTasks(), getEmployees()])
            setTasks(tasksRes.data); setEmployees(empsRes.data)
        } catch { } finally { setLoading(false) }
    }

    useEffect(() => { fetchAll() }, [])

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 5000)
    }

    const handleCreate = async (e) => {
        e.preventDefault(); setSubmitting(true)
        try {
            await createTask(form); setIsModalOpen(false); setForm(EMPTY_FORM); fetchAll()
        } catch (err) { alert(err.response?.data?.error || 'Failed') }
        finally { setSubmitting(false) }
    }

    const moveTask = async (taskId, newStatus) => {
        try {
            await updateTaskStatus(taskId, newStatus)
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
        } catch { showToast('Failed to update status', 'error') }
    }

    const handleLogOnChain = async (task) => {
        setChainLoading(prev => ({ ...prev, [task.id]: true }))
        try {
            const txHash = await logTaskOnChain(task.id, task.employeeId)
            await updateTaskStatus(task.id, 'COMPLETED', txHash)
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'COMPLETED', txHash } : t))
            showToast(`Logged! TX: ${txHash.slice(0, 10)}…${txHash.slice(-6)}`, 'success')
        } catch (err) { showToast(err.message, 'error') }
        finally { setChainLoading(prev => ({ ...prev, [task.id]: false })) }
    }

    const handleDelete = async (taskId) => {
        if (!confirm('Delete this task?')) return
        try { await deleteTask(taskId); setTasks(prev => prev.filter(t => t.id !== taskId)) }
        catch { showToast('Failed to delete', 'error') }
    }

    const filtered = filterEmployee ? tasks.filter(t => t.employeeId === filterEmployee) : tasks

    if (loading) return <LoadingSpinner text="Loading tasks…" />

    return (
        <div className="animate-fadeUp" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '1rem', right: '1rem', zIndex: 200,
                    padding: '0.85rem 1.1rem', borderRadius: '12px',
                    fontSize: '0.82rem', fontWeight: 600, maxWidth: 340,
                    background: toast.type === 'error' ? 'rgba(255,68,102,0.15)' : 'rgba(43,222,142,0.15)',
                    border: `1px solid ${toast.type === 'error' ? 'rgba(255,68,102,0.3)' : 'rgba(43,222,142,0.3)'}`,
                    color: toast.type === 'error' ? 'var(--accent-red)' : 'var(--accent-green)',
                    animation: 'fadeUp 0.25s ease',
                }}>
                    {toast.msg}
                    {toast.type === 'success' && toast.msg.includes('TX:') && (
                        <a href={`https://mumbai.polygonscan.com/tx/${toast.msg.match(/0x[a-fA-F0-9]+/)?.[0]}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ display: 'block', marginTop: '0.3rem', color: 'var(--accent-purple)', fontSize: '0.75rem' }}>
                            View on PolygonScan
                        </a>
                    )}
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <p className="eyebrow" style={{ marginBottom: '0.35rem' }}>Kanban</p>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
                        Tasks <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '1.25rem' }}>({tasks.length})</span>
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select className="field" style={{ maxWidth: 180 }} value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)}>
                        <option value="">All employees</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                    <button onClick={() => { setForm(EMPTY_FORM); setIsModalOpen(true) }} className="btn btn-primary">
                        <Plus size={15} /> Create Task
                    </button>
                </div>
            </div>

            {/* Kanban columns */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem', alignItems: 'start' }}>
                {STATUSES.map(status => {
                    const col = COL_ACCENT[status]
                    const colTasks = filtered.filter(t => t.status === status)

                    return (
                        <div key={status} style={{
                            background: col.alpha + '0.05)',
                            border: `1px solid ${col.alpha + '0.2)'}`,
                            borderRadius: '20px', padding: '1.1rem',
                        }}>
                            {/* Column header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: col.color }}>
                                    {STATUS_ICONS[status]}
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '-0.01em' }}>
                                        {STATUS_LABELS[status]}
                                    </span>
                                </div>
                                <span style={{
                                    background: col.alpha + '0.15)', color: col.color,
                                    border: `1px solid ${col.alpha + '0.25)'}`,
                                    borderRadius: '99px', padding: '0.2rem 0.6rem',
                                    fontSize: '0.72rem', fontWeight: 700,
                                }}>{colTasks.length}</span>
                            </div>

                            {/* Task cards */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minHeight: 120 }}>
                                {colTasks.length === 0 && (
                                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '2rem 0' }}>
                                        No tasks
                                    </div>
                                )}

                                {colTasks.map(task => (
                                    <div key={task.id} style={{
                                        background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                                        borderRadius: '14px', padding: '1rem',
                                        display: 'flex', flexDirection: 'column', gap: '0.65rem',
                                        transition: 'border-color 0.15s',
                                        position: 'relative',
                                    }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = 'var(--border-strong)'
                                            e.currentTarget.querySelector('.del-btn').style.opacity = '1'
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = 'var(--border-default)'
                                            e.currentTarget.querySelector('.del-btn').style.opacity = '0'
                                        }}
                                    >
                                        {/* Delete */}
                                        <button className="del-btn" onClick={() => handleDelete(task.id)}
                                            style={{
                                                position: 'absolute', top: '0.75rem', right: '0.75rem',
                                                background: 'none', border: 'none', opacity: 0, transition: 'opacity 0.15s',
                                                color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem',
                                            }}>
                                            <X size={13} />
                                        </button>

                                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', paddingRight: '1.25rem', lineHeight: 1.4 }}>
                                            {task.title}
                                        </p>

                                        {task.description && (
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {task.description}
                                            </p>
                                        )}

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <PriorityBadge priority={task.priority} />
                                            {task.dueDate && (
                                                <span className="tag tag-gray" style={{ gap: '0.3rem' }}>
                                                    <Calendar size={10} />
                                                    {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </span>
                                            )}
                                        </div>

                                        {task.employee?.name && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                <User size={11} />
                                                {task.employee.name}
                                            </div>
                                        )}

                                        {/* Action buttons */}
                                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                                            {status === 'ASSIGNED' && (
                                                <button onClick={() => moveTask(task.id, 'IN_PROGRESS')} className="btn btn-ghost btn-sm">
                                                    Start <ArrowRight size={11} />
                                                </button>
                                            )}
                                            {status === 'IN_PROGRESS' && (
                                                <button onClick={() => moveTask(task.id, 'COMPLETED')} className="btn btn-ghost btn-sm"
                                                    style={{ color: 'var(--accent-green)', borderColor: 'rgba(43,222,142,0.25)' }}>
                                                    Complete <CheckCircle2 size={11} />
                                                </button>
                                            )}
                                            {status === 'IN_PROGRESS' && (
                                                <button onClick={() => handleLogOnChain(task)} disabled={chainLoading[task.id]} className="btn btn-ghost btn-sm"
                                                    style={{ color: 'var(--accent-purple)', borderColor: 'rgba(184,161,255,0.3)' }}>
                                                    {chainLoading[task.id] ? <LoadingSpinner size="sm" text="" /> : <ExternalLink size={11} />}
                                                    {chainLoading[task.id] ? 'Logging…' : 'Log on Chain'}
                                                </button>
                                            )}
                                            {status === 'COMPLETED' && task.txHash && (
                                                <a href={`https://mumbai.polygonscan.com/tx/${task.txHash}`}
                                                    target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"
                                                    style={{ color: 'var(--accent-purple)', borderColor: 'rgba(184,161,255,0.3)' }}>
                                                    <ExternalLink size={11} /> PolygonScan
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Create Task Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Task">
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label className="field-label">Task Title</label>
                        <input className="field" placeholder="Build user authentication…" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div>
                        <label className="field-label">Description</label>
                        <textarea className="field" style={{ resize: 'none', height: 80 }} placeholder="Task details…"
                            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                        <div>
                            <label className="field-label">Assign To</label>
                            <select className="field" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} required>
                                <option value="">Select employee…</option>
                                {employees.filter(e => e.isActive).map(e => (
                                    <option key={e.id} value={e.id}>{e.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="field-label">Priority</label>
                            <select className="field" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="field-label">Due Date</label>
                        <input type="date" className="field" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.25rem' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Cancel</button>
                        <button type="submit" disabled={submitting} className="btn btn-primary">
                            {submitting ? 'Creating…' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
