import React from 'react'

const MAP = {
    high: { label: 'High', cls: 'tag-red' },
    medium: { label: 'Medium', cls: 'tag-yellow' },
    low: { label: 'Low', cls: 'tag-gray' },
}

export default function PriorityBadge({ priority }) {
    const { label, cls } = MAP[priority?.toLowerCase()] || { label: priority, cls: 'tag-gray' }
    return <span className={`tag ${cls}`}>{label}</span>
}
