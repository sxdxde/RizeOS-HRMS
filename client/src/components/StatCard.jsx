import React from 'react'

export default function StatCard({ title, value, icon, color }) {
    const colorMap = {
        blue: 'border-blue-500 text-blue-400',
        green: 'border-green-500 text-green-400',
        yellow: 'border-yellow-500 text-yellow-400',
        orange: 'border-orange-500 text-orange-400',
        purple: 'border-purple-500 text-purple-400',
        indigo: 'border-indigo-500 text-indigo-400',
        red: 'border-red-500 text-red-400',
        gray: 'border-gray-700 text-gray-400',
    }
    const bgMap = {
        blue: 'bg-blue-500/10',
        green: 'bg-green-500/10',
        yellow: 'bg-yellow-500/10',
        orange: 'bg-orange-500/10',
        purple: 'bg-purple-500/10',
        indigo: 'bg-indigo-500/10',
        red: 'bg-red-500/10',
        gray: 'bg-gray-800',
    }

    return (
        <div className={`card p-5 border-l-4 ${colorMap[color] || colorMap.blue} hover:scale-[1.01] transition-transform duration-200 animate-fadeIn`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-400 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-white mt-1">{value ?? '—'}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${bgMap[color] || bgMap.blue} flex items-center justify-center text-xl`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}
