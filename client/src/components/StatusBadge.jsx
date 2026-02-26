import React from 'react'

export default function StatusBadge({ status }) {
    const config = {
        ASSIGNED: { label: 'Assigned', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
        IN_PROGRESS: { label: 'In Progress', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
        COMPLETED: { label: 'Completed', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
    }
    const cfg = config[status] || { label: status, className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
            {cfg.label}
        </span>
    )
}
