import React, { useState, useEffect } from 'react'
import { getInsights, getSmartAssign } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { BrainCircuit, Trophy, AlertTriangle, PieChart, Sparkles } from 'lucide-react'

export default function AIInsights() {
    const [insights, setInsights] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [taskTitle, setTaskTitle] = useState('')
    const [recommendations, setRecommendations] = useState([])
    const [searching, setSearching] = useState(false)

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const res = await getInsights()
                setInsights(res.data)
            } catch { setError('Failed to load AI insights') }
            finally { setLoading(false) }
        }
        fetchInsights()
    }, [])

    const handleSmartAssign = async (e) => {
        e.preventDefault()
        if (!taskTitle.trim()) return
        setSearching(true)
        try {
            const res = await getSmartAssign(taskTitle)
            setRecommendations(res.data)
        } catch { setError('Smart assign failed') }
        finally { setSearching(false) }
    }

    if (loading) return <LoadingSpinner text="Analyzing org intelligence..." />
    if (error && !insights) return <div className="text-red-400 text-center py-10">{error}</div>

    const scoreColor = (score) =>
        score >= 80 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'

    return (
        <div className="space-y-6 animate-fadeIn">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BrainCircuit className="w-6 h-6 text-indigo-400" /> AI Insights
                </h1>
                <p className="text-gray-400 text-sm mt-1">AI-powered analytics across your organization</p>
            </div>

            {/* Avg Score */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card p-5 sm:col-span-1 flex flex-col items-center justify-center text-center">
                    <p className="text-gray-400 text-sm mb-2">Org Avg Score</p>
                    <div className={`text-5xl font-bold mb-1 ${scoreColor(insights?.avgProductivityScore)}`}>
                        {insights?.avgProductivityScore ?? '—'}
                    </div>
                    <p className="text-gray-500 text-xs">{insights?.totalAnalyzed} employees analyzed</p>
                </div>
                <div className="card p-5">
                    <p className="text-gray-400 text-sm mb-3">High Performers</p>
                    <p className="text-3xl font-bold text-green-400">{insights?.highPerformers?.length ?? 0}</p>
                    <p className="text-gray-500 text-xs mt-1">Score &gt; 80</p>
                </div>
                <div className="card p-5">
                    <p className="text-gray-400 text-sm mb-3">Needs Attention</p>
                    <p className="text-3xl font-bold text-red-400">{insights?.lowPerformers?.length ?? 0}</p>
                    <p className="text-gray-500 text-xs mt-1">Score &lt; 50 — intervention suggested</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* High Performers */}
                <div className="card p-5">
                    <h2 className="section-title mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-green-400" /> High Performers
                    </h2>
                    {insights?.highPerformers?.length === 0 ? (
                        <p className="text-gray-500 text-sm">No high performers yet</p>
                    ) : (
                        <div className="space-y-2">
                            {insights?.highPerformers?.map(emp => (
                                <div key={emp.id} className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                                    <div>
                                        <p className="text-white text-sm font-medium">{emp.name}</p>
                                        <p className="text-gray-400 text-xs">{emp.department}</p>
                                    </div>
                                    <div className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold px-2.5 py-1 rounded-full">
                                        {emp.score}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Low Performers */}
                <div className="card p-5">
                    <h2 className="section-title mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" /> Needs Intervention
                    </h2>
                    {insights?.lowPerformers?.length === 0 ? (
                        <p className="text-gray-500 text-sm">No low performers — great!</p>
                    ) : (
                        <div className="space-y-2">
                            {insights?.lowPerformers?.map(emp => (
                                <div key={emp.id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                                    <div>
                                        <p className="text-white text-sm font-medium">{emp.name}</p>
                                        <p className="text-gray-400 text-xs">{emp.department}</p>
                                    </div>
                                    <div className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-2.5 py-1 rounded-full">
                                        {emp.score}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Department Breakdown */}
            <div className="card p-5">
                <h2 className="section-title mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-indigo-400" /> Department Breakdown
                </h2>
                {insights?.departmentBreakdown?.length === 0 ? (
                    <p className="text-gray-500 text-sm">No data yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-gray-400 border-b border-gray-700">
                                    <th className="text-left py-2 pr-4">Department</th>
                                    <th className="text-left py-2 pr-4">Employees</th>
                                    <th className="text-left py-2 pr-4">Avg Score</th>
                                    <th className="text-left py-2">Bar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {insights?.departmentBreakdown?.map(dept => (
                                    <tr key={dept.department} className="border-b border-gray-700/50">
                                        <td className="py-3 pr-4 text-white font-medium">{dept.department}</td>
                                        <td className="py-3 pr-4 text-gray-400">{dept.employeeCount}</td>
                                        <td className={`py-3 pr-4 font-semibold ${scoreColor(dept.avgScore)}`}>{dept.avgScore}</td>
                                        <td className="py-3">
                                            <div className="w-full max-w-[120px] bg-gray-700 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full ${dept.avgScore >= 80 ? 'bg-green-500' : dept.avgScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    style={{ width: `${dept.avgScore}%` }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Smart Assignment */}
            <div className="card p-5">
                <h2 className="section-title mb-1 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" /> Smart Task Assignment
                </h2>
                <p className="text-gray-400 text-sm mb-4">AI recommends the best employees for a task based on skills and performance</p>

                <form onSubmit={handleSmartAssign} className="flex gap-3 mb-5">
                    <input
                        className="input-field flex-1"
                        placeholder="Enter a task title... e.g. 'Build React Dashboard'"
                        value={taskTitle}
                        onChange={e => setTaskTitle(e.target.value)}
                    />
                    <button type="submit" disabled={searching} className="btn-primary whitespace-nowrap">
                        {searching ? 'Searching...' : 'Find Best Match'}
                    </button>
                </form>

                {recommendations.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-gray-400 text-sm">Top recommendations for: <span className="text-white">"{taskTitle}"</span></p>
                        {recommendations.map((emp, i) => (
                            <div key={emp.id} className="flex items-start gap-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 hover:bg-indigo-500/10 transition-colors">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${i === 0 ? 'bg-yellow-500 text-yellow-900' : i === 1 ? 'bg-gray-400 text-gray-900' : 'bg-amber-700 text-amber-100'
                                    }`}>
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-white font-medium">{emp.name}</span>
                                        <span className="text-gray-400 text-xs">·</span>
                                        <span className="text-gray-400 text-xs">{emp.role}</span>
                                    </div>
                                    <p className="text-gray-400 text-xs mt-1">{emp.reason}</p>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {emp.skills.slice(0, 4).map(s => (
                                            <span key={s} className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full border border-indigo-500/30">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="text-indigo-400 font-bold text-sm">Score: {emp.score}</div>
                                    <div className="text-gray-500 text-xs">{emp.completedTasks} done</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
