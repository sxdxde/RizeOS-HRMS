import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../services/api'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import { Users, CheckCircle, Clock, Zap, Target, Trophy } from 'lucide-react'

export default function Dashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchData = useCallback(async () => {
        try {
            const res = await getDashboard()
            setData(res.data)
            setError('')
        } catch (err) {
            setError('Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [fetchData])

    if (loading) return <LoadingSpinner text="Loading dashboard..." />
    if (error) return <div className="text-center text-red-400 py-10">{error}</div>

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'

    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">Organization overview — auto-refreshes every 30s</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard title="Total Employees" value={data?.totalEmployees} icon={<Users className="w-5 h-5" />} color="gray" />
                <StatCard title="Active Employees" value={data?.activeEmployees} icon={<CheckCircle className="w-5 h-5" />} color="gray" />
                <StatCard title="Assigned Tasks" value={data?.assignedTasks} icon={<Target className="w-5 h-5" />} color="gray" />
                <StatCard title="In Progress" value={data?.inProgressTasks} icon={<Clock className="w-5 h-5" />} color="gray" />
                <StatCard title="Completed" value={data?.completedTasks} icon={<Zap className="w-5 h-5" />} color="gray" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Tasks */}
                <div className="lg:col-span-2 card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-title">Recent Tasks</h2>
                        <Link to="/tasks" className="text-indigo-400 hover:text-indigo-300 text-sm">View all →</Link>
                    </div>
                    {data?.recentTasks?.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">No tasks yet</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-gray-400 border-b border-gray-700">
                                        <th className="text-left py-2 pr-4">Task</th>
                                        <th className="text-left py-2 pr-4">Employee</th>
                                        <th className="text-left py-2 pr-4">Status</th>
                                        <th className="text-left py-2">Priority</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.recentTasks?.map((task) => (
                                        <tr key={task.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                                            <td className="py-2.5 pr-4">
                                                <span className="text-white font-medium truncate max-w-[150px] block">{task.title}</span>
                                            </td>
                                            <td className="py-2.5 pr-4 text-gray-300">{task.employee?.name || '—'}</td>
                                            <td className="py-2.5 pr-4"><StatusBadge status={task.status} /></td>
                                            <td className="py-2.5"><PriorityBadge priority={task.priority} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Top Performers */}
                <div className="card p-5">
                    <h2 className="section-title mb-4">Top Performers</h2>
                    {data?.topPerformers?.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">No data yet</div>
                    ) : (
                        <div className="space-y-3">
                            {data?.topPerformers?.map((emp, i) => (
                                <Link
                                    key={emp.id}
                                    to={`/employees/${emp.id}`}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/40 hover:bg-gray-700/70 transition-colors group"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-500 text-yellow-900' :
                                        i === 1 ? 'bg-gray-400 text-gray-900' :
                                            'bg-amber-700 text-amber-100'
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate group-hover:text-indigo-300 transition-colors">{emp.name}</p>
                                        <p className="text-gray-400 text-xs truncate">{emp.role}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="text-gray-300 font-semibold text-sm">{emp.completedTasks}</span>
                                        <p className="text-gray-500 text-xs">done</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                    <Link to="/employees" className="block mt-4 text-center text-indigo-400 hover:text-indigo-300 text-sm">
                        View all employees →
                    </Link>
                </div>
            </div>
        </div>
    )
}
