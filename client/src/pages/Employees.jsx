import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../services/api'
import Modal from '../components/Modal'
import LoadingSpinner from '../components/LoadingSpinner'
import { Plus, Search } from 'lucide-react'

const ROLES = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Product Manager', 'Data Analyst']
const DEPTS = ['Engineering', 'Infrastructure', 'Analytics', 'Product', 'Design', 'HR', 'Finance']
const EMPTY_FORM = { name: '', email: '', role: '', department: '', skills: '', walletAddress: '' }

// initials avatar
const Avatar = ({ name, size = 40 }) => {
    const colors = ['#3d31ff', '#7b5ea7', '#2bde8e', '#f5e642']
    const c = colors[(name?.charCodeAt(0) || 0) % colors.length]
    const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
    return (
        <div style={{
            width: size, height: size, borderRadius: '10px', background: c,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.38, fontWeight: 800, color: '#fff', flexShrink: 0,
            letterSpacing: '-0.03em',
        }}>{initials}</div>
    )
}

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
        try { const res = await getEmployees(); setEmployees(res.data) }
        catch { setError('Failed to load employees') }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchEmployees() }, [])

    const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setIsModalOpen(true) }
    const openEdit = (emp) => {
        setForm({ name: emp.name, email: emp.email, role: emp.role, department: emp.department, skills: emp.skills.join(', '), walletAddress: emp.walletAddress || '' })
        setEditId(emp.id); setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); setSubmitting(true)
        try {
            const data = { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) }
            if (editId) await updateEmployee(editId, data)
            else await createEmployee(data)
            setIsModalOpen(false); fetchEmployees()
        } catch (err) { alert(err.response?.data?.error || 'Operation failed') }
        finally { setSubmitting(false) }
    }

    const handleDeactivate = async (emp) => {
        if (!confirm(`Deactivate ${emp.name}?`)) return
        try { await deleteEmployee(emp.id); fetchEmployees() }
        catch { alert('Failed to deactivate employee') }
    }

    const filtered = employees.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.department.toLowerCase().includes(search.toLowerCase()) ||
        e.role.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return <LoadingSpinner text="Loading employees…" />

    return (
        <div className="animate-fadeUp" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <p className="eyebrow" style={{ marginBottom: '0.35rem' }}>Team</p>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
                        Employees <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '1.25rem' }}>({employees.length})</span>
                    </h1>
                </div>
                <button onClick={openCreate} className="btn btn-primary">
                    <Plus size={15} /> Add Employee
                </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 340 }}>
                <Search size={15} style={{
                    position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--text-muted)', pointerEvents: 'none',
                }} />
                <input type="text" className="field" placeholder="Search by name, role, dept…"
                    value={search} onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: '2.4rem' }} />
            </div>

            {error && <p style={{ color: 'var(--accent-red)', fontSize: '0.83rem' }}>{error}</p>}

            {/* Card grid */}
            {filtered.length === 0 ? (
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '20px',
                    padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem',
                }}>No employees found</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.85rem' }}
                    className="stagger">
                    {filtered.map(emp => (
                        <div key={emp.id} style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                            borderRadius: '20px', padding: '1.25rem',
                            display: 'flex', flexDirection: 'column', gap: '1rem',
                            transition: 'border-color 0.18s, transform 0.18s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.transform = 'translateY(0)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                <Avatar name={emp.name} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <Link to={`/employees/${emp.id}`} style={{
                                        fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)',
                                        display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        transition: 'color 0.15s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-purple)'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                    >
                                        {emp.name}
                                    </Link>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {emp.role}
                                    </p>
                                </div>
                                <span style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: emp.isActive ? '#2bde8e' : 'var(--text-muted)',
                                    flexShrink: 0,
                                }} title={emp.isActive ? 'Active' : 'Inactive'} />
                            </div>

                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.5rem 0.85rem',
                                background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
                                fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600,
                                letterSpacing: '0.03em', textTransform: 'uppercase',
                            }}>
                                {emp.department}
                            </div>

                            {emp.skills.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                    {emp.skills.slice(0, 3).map(s => (
                                        <span key={s} className="tag tag-blue">{s}</span>
                                    ))}
                                    {emp.skills.length > 3 && (
                                        <span className="tag tag-gray">+{emp.skills.length - 3}</span>
                                    )}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-default)', paddingTop: '0.75rem' }}>
                                <button onClick={() => openEdit(emp)} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>Edit</button>
                                {emp.isActive && (
                                    <button onClick={() => handleDeactivate(emp)} className="btn btn-danger btn-sm">Deactivate</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? 'Edit Employee' : 'Add Employee'}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                        <div>
                            <label className="field-label">Full Name</label>
                            <input className="field" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div>
                            <label className="field-label">Email</label>
                            <input type="email" className="field" placeholder="john@co.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                        <div>
                            <label className="field-label">Role</label>
                            <select className="field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required>
                                <option value="">Select role…</option>
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="field-label">Department</label>
                            <select className="field" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required>
                                <option value="">Select dept…</option>
                                {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="field-label">Skills <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(comma-separated)</span></label>
                        <input className="field" placeholder="React, TypeScript, Git…" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
                    </div>
                    <div>
                        <label className="field-label">Wallet Address <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                        <input className="field" placeholder="0x…" value={form.walletAddress} onChange={e => setForm({ ...form, walletAddress: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.25rem' }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">Cancel</button>
                        <button type="submit" disabled={submitting} className="btn btn-primary">
                            {submitting ? 'Saving…' : editId ? 'Update' : 'Add Employee'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
