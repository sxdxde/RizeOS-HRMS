import React from 'react'

export default function PriorityBadge({ priority }) {
    const config = {
        high: { label: 'High', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
        medium: { label: 'Medium', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
        low: { label: 'Low', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
    }
    const cfg = config[priority?.toLowerCase()] || config.medium
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}>
            {cfg.label}
        </span>
    )
}
