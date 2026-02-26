import React, { useState, useEffect } from 'react'
import { getTasks, createTask, updateTaskStatus, deleteTask, getEmployees } from '../services/api'
import { logTaskOnChain } from '../services/web3'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import { CheckCircle2, CircleDashed, Clock, X, User, Calendar, ExternalLink, ArrowRight } from 'lucide-react'

const STATUSES = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED']
const STATUS_LABELS = { ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed' }
const STATUS_ICONS = {
    ASSIGNED: <CircleDashed className="w-4 h-4" />,
    IN_PROGRESS: <Clock className="w-4 h-4" />,
    COMPLETED: <CheckCircle2 className="w-4 h-4" />
}
const STATUS_COLORS = {
    ASSIGNED: 'border-blue-500/30 bg-blue-500/5',
    IN_PROGRESS: 'border-yellow-500/30 bg-yellow-500/5',
    COMPLETED: 'border-emerald-500/30 bg-emerald-500/5',
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
            setTasks(tasksRes.data)
            setEmployees(empsRes.data)
        } catch { } finally { setLoading(false) }
    }

    useEffect(() => { fetchAll() }, [])

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 5000)
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            await createTask(form)
            setIsModalOpen(false)
            setForm(EMPTY_FORM)
            fetchAll()
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create task')
        } finally { setSubmitting(false) }
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
            showToast(`Logged! TX: ${txHash.slice(0, 10)}...${txHash.slice(-6)}`, 'success')
        } catch (err) {
            showToast(`${err.message}`, 'error')
        } finally {
            setChainLoading(prev => ({ ...prev, [task.id]: false }))
        }
    }

    const handleDelete = async (taskId) => {
        if (!confirm('Delete this task?')) return
        try {
            await deleteTask(taskId)
            setTasks(prev => prev.filter(t => t.id !== taskId))
        } catch { showToast('Failed to delete task', 'error') }
    }

    const filteredTasks = filterEmployee
        ? tasks.filter(t => t.employeeId === filterEmployee)
        : tasks

    if (loading) return <LoadingSpinner text="Loading tasks..." />

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl text-sm font-medium max-w-sm animate-fadeIn ${toast.type === 'error' ? 'bg-red-500/20 border border-red-500/40 text-red-300' : 'bg-green-500/20 border border-green-500/40 text-green-300'
                    }`}>
                    {toast.msg}
                    {toast.type === 'success' && toast.msg.includes('TX:') && (
                        <a
                            href={`https://mumbai.polygonscan.com/tx/${toast.msg.match(/0x[a-fA-F0-9]+/)?.[0]}`}
                            target="_blank" rel="noopener noreferrer"
                            className="block mt-1 text-indigo-400 hover:text-indigo-300 underline text-xs"
                        >View on PolygonScan →</a>
                    )}
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Tasks</h1>
                    <p className="text-gray-400 text-sm mt-1">Kanban board — {tasks.length} total tasks</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        className="input-field text-sm py-2"
                        value={filterEmployee}
                        onChange={e => setFilterEmployee(e.target.value)}
                    >
                        <option value="">All employees</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                    <button onClick={() => { setForm(EMPTY_FORM); setIsModalOpen(true) }} className="btn-primary whitespace-nowrap">
                        + Create Task
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STATUSES.map(status => {
                    const colTasks = filteredTasks.filter(t => t.status === status)
                    return (
                        <div key={status} className={`rounded-xl border ${STATUS_COLORS[status]} p-4 min-h-[400px]`}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-white flex items-center gap-2">
                                    <span>{STATUS_ICONS[status]}</span>
                                    {STATUS_LABELS[status]}
                                </h2>
                                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{colTasks.length}</span>
                            </div>

                            <div className="space-y-3">
                                {colTasks.length === 0 && (
                                    <div className="text-center text-gray-600 py-8 text-sm">No tasks here</div>
                                )}
                                {colTasks.map(task => (
                                    <div key={task.id} className="card p-4 hover:border-gray-600 transition-colors group">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <span className="text-white text-sm font-medium leading-tight">{task.title}</span>
                                            <button
                                                onClick={() => handleDelete(task.id)}
                                                className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs flex-shrink-0"
                                            >✕</button>
                                        </div>

                                        {task.description && (
                                            <p className="text-gray-500 text-xs mb-2 line-clamp-2">{task.description}</p>
                                        )}

                                        <div className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5" />
                                            {task.employee?.name || '—'}
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap mb-3">
                                            <PriorityBadge priority={task.priority} />
                                            {task.dueDate && (
                                                <span className="text-gray-500 text-xs flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </span>
                                            )}
                                        </div>

                                        {/* Move buttons */}
                                        <div className="flex gap-2 flex-wrap pb-1">
                                            {status === 'ASSIGNED' && (
                                                <button
                                                    onClick={() => moveTask(task.id, 'IN_PROGRESS')}
                                                    className="text-xs flex items-center gap-1 bg-gray-800 text-gray-300 border border-gray-700 px-2 py-1 rounded hover:bg-gray-700 hover:text-white transition-colors"
                                                >
                                                    In Progress <ArrowRight className="w-3 h-3" />
                                                </button>
                                            )}
                                            {status === 'IN_PROGRESS' && (
                                                <button
                                                    onClick={() => moveTask(task.id, 'COMPLETED')}
                                                    className="text-xs flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded hover:bg-emerald-500/20 transition-colors"
                                                >
                                                    Complete <CheckCircle2 className="w-3 h-3" />
                                                </button>
                                            )}
                                            {status === 'IN_PROGRESS' && (
                                                <button
                                                    onClick={() => handleLogOnChain(task)}
                                                    disabled={chainLoading[task.id]}
                                                    className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-1 flex items-center gap-1.5 rounded hover:bg-indigo-500/30 transition-colors disabled:opacity-50"
                                                >
                                                    {chainLoading[task.id] ? <LoadingSpinner size="sm" text="" /> : <ExternalLink className="w-3 h-3" />}
                                                    {chainLoading[task.id] ? 'Logging...' : 'Log on Chain'}
                                                </button>
                                            )}
                                            {status === 'COMPLETED' && task.txHash && (
                                                <a
                                                    href={`https://mumbai.polygonscan.com/tx/${task.txHash}`}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="text-xs flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded hover:bg-indigo-500/20 transition-colors"
                                                ><ExternalLink className="w-3 h-3" /> PolygonScan</a>
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
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Task">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="label">Task Title</label>
                        <input className="input-field" placeholder="Build user authentication..." value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div>
                        <label className="label">Description</label>
                        <textarea className="input-field resize-none h-20" placeholder="Task details..."
                            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Assign To</label>
                            <select className="input-field" value={form.employeeId}
                                onChange={e => setForm({ ...form, employeeId: e.target.value })} required>
                                <option value="">Select employee...</option>
                                {employees.filter(e => e.isActive).map(e => (
                                    <option key={e.id} value={e.id}>{e.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">Priority</label>
                            <select className="input-field" value={form.priority}
                                onChange={e => setForm({ ...form, priority: e.target.value })}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="label">Due Date</label>
                        <input type="date" className="input-field" value={form.dueDate}
                            onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={submitting} className="btn-primary">
                            {submitting ? 'Creating...' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
