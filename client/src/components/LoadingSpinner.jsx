import React from 'react'

export default function LoadingSpinner({ text = 'Loading…', size = 'md' }) {
    const s = size === 'sm' ? 16 : 28
    return (
        <div style={{
            display: 'flex', flexDirection: size === 'sm' ? 'row' : 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: size === 'sm' ? '0.4rem' : '0.75rem',
            padding: size === 'sm' ? 0 : '3rem',
            color: 'var(--text-muted)',
        }}>
            <div style={{
                width: s, height: s,
                border: `2px solid rgba(255,255,255,0.08)`,
                borderTopColor: 'var(--accent-blue)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
            }} />
            {text && <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{text}</span>}
        </div>
    )
}
