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
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [empRes, prodRes, gapRes] = await Promise.all([
                    getEmployee(id),
                    getProductivity(id),
                    getSkillGap(id),
                ])
                setEmployee(empRes.data)
                setProductivity(prodRes.data)
                setSkillGap(gapRes.data)
            } catch (err) {
                setError('Failed to load employee data')
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [id])

    if (loading) return <LoadingSpinner text="Loading employee profile..." />
    if (error) return <div className="text-red-400 text-center py-10">{error}</div>
    if (!employee) return <div className="text-gray-400 text-center py-10">Employee not found</div>

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Back + header */}
            <div>
                <Link to="/employees" className="text-gray-400 hover:text-white text-sm flex items-center gap-1.5 mb-4 w-fit transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Employees
                </Link>
                <h1 className="text-2xl font-bold text-white">{employee.name}</h1>
                <p className="text-gray-400 text-sm mt-1">{employee.role} · {employee.department}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="card p-6 space-y-5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                            {employee.name[0].toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">{employee.name}</h2>
                            <p className="text-gray-400 text-sm">{employee.email}</p>
                        </div>
                    </div>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Role</span>
                            <span className="text-white">{employee.role}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Department</span>
                            <span className="text-white">{employee.department}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Status</span>
                            <span className={`font-medium flex items-center gap-1.5 ${employee.isActive ? 'text-green-400' : 'text-gray-500'}`}>
                                <span className={`w-2 h-2 rounded-full ${employee.isActive ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                                {employee.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Joined</span>
                            <span className="text-white">{formatDate(employee.createdAt)}</span>
                        </div>
                        {employee.walletAddress && (
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-gray-400 flex-shrink-0">Wallet</span>
                                <span className="text-indigo-400 text-xs font-mono break-all text-right">
                                    {employee.walletAddress.slice(0, 10)}...{employee.walletAddress.slice(-6)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Skills */}
                    <div>
                        <p className="text-gray-400 text-sm mb-2">Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                            {employee.skills.map(skill => (
                                <span key={skill} className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2.5 py-1 rounded-full">
                                    {skill}
                                </span>
                            ))}
                            {employee.skills.length === 0 && <span className="text-gray-500 text-xs">No skills listed</span>}
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Productivity Score */}
                    {productivity && (
                        <ProductivityScore score={productivity.score} label={productivity.label} breakdown={productivity.breakdown} />
                    )}

                    {/* Skill Gap */}
                    {skillGap && (
                        <div className="card p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-gray-400">Skill Gap Analysis</h3>
                                <span className={`text-sm font-semibold ${skillGap.matchPercent >= 80 ? 'text-green-400' : skillGap.matchPercent >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {skillGap.matchPercent}% match
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                                <div
                                    className={`h-2 rounded-full transition-all duration-700 ${skillGap.matchPercent >= 80 ? 'bg-green-500' : skillGap.matchPercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${skillGap.matchPercent}%` }}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-xs mb-2 font-medium uppercase tracking-wider">Required Skills</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {skillGap.required.map(skill => {
                                            const isMissing = skillGap.missing.includes(skill)
                                            return (
                                                <span key={skill} className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 ${isMissing
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                                    : 'bg-green-500/10 text-green-400 border-green-500/30'
                                                    }`}>
                                                    {isMissing ? <X className="w-3 h-3 flex-shrink-0" /> : <Check className="w-3 h-3 flex-shrink-0" />}{skill}
                                                </span>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs mb-2 font-medium uppercase tracking-wider">Missing Skills</p>
                                    {skillGap.missing.length === 0 ? (
                                        <p className="text-green-400 text-sm">All skills matched!</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {skillGap.missing.map(skill => (
                                                <span key={skill} className="bg-red-500/10 text-red-400 border border-red-500/30 text-xs px-2.5 py-1 rounded-full">
                                                    {skill}
                                                </span>
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
            <div className="card p-5">
                <h2 className="section-title mb-4">Task History ({employee.tasks?.length || 0})</h2>
                {(!employee.tasks || employee.tasks.length === 0) ? (
                    <div className="text-center text-gray-500 py-8">No tasks assigned yet</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-400 border-b border-gray-700">
                                    <th className="text-left py-2 pr-4">Title</th>
                                    <th className="text-left py-2 pr-4 hidden sm:table-cell">Status</th>
                                    <th className="text-left py-2 pr-4 hidden md:table-cell">Priority</th>
                                    <th className="text-left py-2 hidden md:table-cell">Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employee.tasks.map(task => (
                                    <tr key={task.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                                        <td className="py-2.5 pr-4">
                                            <span className="text-white font-medium">{task.title}</span>
                                            {task.txHash && (
                                                <a
                                                    href={`https://mumbai.polygonscan.com/tx/${task.txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-2 inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> Chain
                                                </a>
                                            )}
                                            <div className="sm:hidden mt-0.5"><StatusBadge status={task.status} /></div>
                                        </td>
                                        <td className="py-2.5 pr-4 hidden sm:table-cell"><StatusBadge status={task.status} /></td>
                                        <td className="py-2.5 pr-4 hidden md:table-cell"><PriorityBadge priority={task.priority} /></td>
                                        <td className="py-2.5 hidden md:table-cell text-gray-400">
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
