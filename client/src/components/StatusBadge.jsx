import React from 'react'

const STATUS_MAP = {
    ASSIGNED: { label: 'Assigned', cls: 'tag-blue' },
    IN_PROGRESS: { label: 'In Progress', cls: 'tag-yellow' },
    COMPLETED: { label: 'Completed', cls: 'tag-green' },
}

export default function StatusBadge({ status }) {
    const { label, cls } = STATUS_MAP[status] || { label: status, cls: 'tag-gray' }
    return <span className={`tag ${cls}`}>{label}</span>
}
