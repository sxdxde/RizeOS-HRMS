import React from 'react'

export default function ProductivityScore({ score, label, breakdown }) {
    const color = score >= 80 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'
    const ringColor = score >= 80 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'
    const circumference = 2 * Math.PI * 42
    const dashOffset = circumference - (score / 100) * circumference

    return (
        <div className="card p-5">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Productivity Score</h3>
            <div className="flex items-center gap-6">
                {/* Circular progress */}
                <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                        <circle cx="48" cy="48" r="42" fill="none" stroke="#374151" strokeWidth="8" />
                        <circle
                            cx="48" cy="48" r="42"
                            fill="none"
                            stroke={ringColor}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            style={{ transition: 'stroke-dashoffset 1s ease' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-xl font-bold ${color}`}>{score}</span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex-1 space-y-2">
                    <div className={`text-base font-semibold ${color}`}>{label} Performance</div>
                    {breakdown && (
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Total Tasks</span>
                                <span className="text-white font-medium">{breakdown.total}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Completed</span>
                                <span className="text-white font-medium">{breakdown.completed}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Completion Rate</span>
                                <span className={`font-medium ${color}`}>{breakdown.completionRate}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">On-Time Rate</span>
                                <span className={`font-medium ${color}`}>{breakdown.onTimeRate}%</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
