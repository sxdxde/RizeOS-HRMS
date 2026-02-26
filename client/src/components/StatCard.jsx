import React from 'react'

export default function StatCard({ title, value, icon, accent }) {
    // accent: 'blue' | 'yellow' | 'purple' | 'green' | 'red' | 'default'
    const themes = {
        blue: { bg: 'var(--accent-blue)', color: '#fff', iconBg: 'rgba(255,255,255,0.15)' },
        yellow: { bg: 'var(--accent-yellow)', color: '#111', iconBg: 'rgba(0,0,0,0.1)' },
        purple: { bg: 'var(--accent-purple)', color: '#111', iconBg: 'rgba(0,0,0,0.1)' },
        green: { bg: 'rgba(43,222,142,0.12)', color: 'var(--accent-green)', iconBg: 'rgba(43,222,142,0.2)' },
        red: { bg: 'rgba(255,68,102,0.12)', color: 'var(--accent-red)', iconBg: 'rgba(255,68,102,0.2)' },
        default: { bg: 'var(--bg-card)', color: 'var(--text-primary)', iconBg: 'rgba(255,255,255,0.06)' },
    }
    const t = themes[accent] || themes.default

    return (
        <div className="animate-fadeUp" style={{
            background: t.bg,
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            transition: 'transform 0.18s ease',
        }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: t.color, opacity: 0.65, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {title}
                </p>
                <div style={{
                    width: 36, height: 36, borderRadius: '10px',
                    background: t.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: t.color,
                }}>
                    {icon}
                </div>
            </div>
            <p style={{ fontSize: '2.25rem', fontWeight: 800, color: t.color, letterSpacing: '-0.04em', lineHeight: 1 }}>
                {value ?? '—'}
            </p>
        </div>
    )
}
