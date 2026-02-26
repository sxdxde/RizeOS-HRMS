import React from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null
    return (
        <div onClick={onClose} style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.2s ease',
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                background: '#141414',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '520px',
                maxHeight: '90vh',
                overflowY: 'auto',
                animation: 'fadeUp 0.25s ease',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                        {title}
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px',
                        width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,68,102,0.15)'; e.currentTarget.style.color = 'var(--accent-red)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                    >
                        <X size={15} />
                    </button>
                </div>
                {/* Body */}
                <div style={{ padding: '1.5rem' }}>{children}</div>
            </div>
        </div>
    )
}
