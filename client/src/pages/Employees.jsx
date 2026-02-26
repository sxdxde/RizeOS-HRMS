import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../services/api'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'

const ROLES = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'DevOps Engineer', 'Product Manager', 'Data Analyst',
]

const DEPTS = ['Engineering', 'Infrastructure', 'Analytics', 'Product', 'Design', 'HR', 'Finance']

const EMPTY_FORM = { name: '', email: '', role: '', department: '', skills: '', walletAddress: '' }

export default function Employees() {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [search, setSearch] = useState('')

    const fetchEmployees = async () => {
        try {
            const res = await getEmployees()
            setEmployees(res.data)
        } catch { setError('Failed to load employees') }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchEmployees() }, [])

    const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setIsModalOpen(true) }
    const openEdit = (emp) => {
        setForm({
            name: emp.name, email: emp.email, role: emp.role, department: emp.department,
            skills: emp.skills.join(', '), walletAddress: emp.walletAddress || ''
        })
        setEditId(emp.id)
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const data = {
                ...form,
                skills: form.skills.split(',').map(s => s.trim()).filter(Boolean)
            }
            if (editId) {
                await updateEmployee(editId, data)
            } else {
                await createEmployee(data)
            }
            setIsModalOpen(false)
            fetchEmployees()
        } catch (err) {
            alert(err.response?.data?.error || 'Operation failed')
        } finally { setSubmitting(false) }
    }

    const handleDeactivate = async (emp) => {
        if (!confirm(`Deactivate ${emp.name}?`)) return
        try {
            await deleteEmployee(emp.id)
            fetchEmployees()
        } catch { alert('Failed to deactivate employee') }
    }

    const filtered = employees.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.department.toLowerCase().includes(search.toLowerCase()) ||
        e.role.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return <LoadingSpinner text="Loading employees..." />

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Employees</h1>
                    <p className="text-gray-400 text-sm mt-1">{employees.length} total employees</p>
                </div>
                <button onClick={openCreate} className="btn-primary flex items-center gap-2 self-start">
                    <span>+</span> Add Employee
                </button>
            </div>

            {/* Search */}
            <input
                type="text"
                className="input-field max-w-sm"
                placeholder="Search by name, role, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {error && <div className="text-red-400 text-sm">{error}</div>}

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-700/50">
                            <tr className="text-gray-400">
                                <th className="text-left px-4 py-3">Name</th>
                                <th className="text-left px-4 py-3 hidden sm:table-cell">Role</th>
                                <th className="text-left px-4 py-3 hidden md:table-cell">Department</th>
                                <th className="text-left px-4 py-3 hidden lg:table-cell">Skills</th>
                                <th className="text-left px-4 py-3">Status</th>
                                <th className="text-right px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} className="text-center text-gray-500 py-10">No employees found</td></tr>
                            ) : filtered.map((emp) => (
                                <tr key={emp.id} className="border-t border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                                    <td className="px-4 py-3">
                                        <Link to={`/employees/${emp.id}`} className="text-white hover:text-indigo-300 font-medium transition-colors">
                                            {emp.name}
                                        </Link>
                                        <div className="text-xs text-gray-500 sm:hidden">{emp.role}</div>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell text-gray-300">{emp.role}</td>
                                    <td className="px-4 py-3 hidden md:table-cell text-gray-400">{emp.department}</td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {emp.skills.slice(0, 3).map(s => (
                                                <span key={s} className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2 py-0.5 rounded-full">{s}</span>
                                            ))}
                                            {emp.skills.length > 3 && <span className="text-gray-500 text-xs">+{emp.skills.length - 3}</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${emp.isActive ? 'text-green-400' : 'text-gray-500'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${emp.isActive ? 'bg-green-400' : 'bg-gray-500'}`} />
                                            {emp.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEdit(emp)} className="text-indigo-400 hover:text-indigo-300 text-xs px-2 py-1 rounded hover:bg-indigo-500/10 transition-colors">Edit</button>
                                            {emp.isActive && (
                                                <button onClick={() => handleDeactivate(emp)} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-500/10 transition-colors">Deactivate</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? 'Edit Employee' : 'Add Employee'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Full Name</label>
                            <input className="input-field" placeholder="John Doe" value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div>
                            <label className="label">Email</label>
                            <input type="email" className="input-field" placeholder="john@company.com" value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Role</label>
                            <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required>
                                <option value="">Select role...</option>
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Department</label>
                            <select className="input-field" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required>
                                <option value="">Select dept...</option>
                                {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="label">Skills <span className="text-gray-500">(comma-separated)</span></label>
                        <input className="input-field" placeholder="React, TypeScript, Git..." value={form.skills}
                            onChange={e => setForm({ ...form, skills: e.target.value })} />
                    </div>
                    <div>
                        <label className="label">Wallet Address <span className="text-gray-500">(optional)</span></label>
                        <input className="input-field" placeholder="0x..." value={form.walletAddress}
                            onChange={e => setForm({ ...form, walletAddress: e.target.value })} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={submitting} className="btn-primary">
                            {submitting ? 'Saving...' : editId ? 'Update Employee' : 'Add Employee'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
