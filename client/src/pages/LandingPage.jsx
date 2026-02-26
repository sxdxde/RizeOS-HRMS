import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BrainCircuit, Users, CheckCircle, BarChart3, ShieldCheck } from 'lucide-react'

const features = [
    {
        title: "AI-Powered Insights",
        description: "Analyze employee productivity and predict skill gaps instantly.",
        icon: <BrainCircuit size={20} color="var(--accent-purple)" />
    },
    {
        title: "Smart Task Assignment",
        description: "Automatically match tasks to the best-suited employees.",
        icon: <CheckCircle size={20} color="var(--accent-blue)" />
    },
    {
        title: "Employee Management",
        description: "Keep track of your entire workforce in one unified dashboard.",
        icon: <Users size={20} color="var(--accent-green)" />
    },
    {
        title: "Real-time Analytics",
        description: "Data-driven decisions with real-time tracking and metrics.",
        icon: <BarChart3 size={20} color="var(--accent-yellow)" />
    },
    {
        title: "Web3 Verification",
        description: "Log completed tasks immutably on the Polygon blockchain.",
        icon: <ShieldCheck size={20} color="var(--accent-red)" />
    }
]

export default function LandingPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
            {/* Nav */}
            <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
                style={{
                    position: 'fixed', top: 0, width: '100%', zIndex: 50,
                    background: 'rgba(8,8,8,0.8)', backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid var(--border-default)',
                }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '10px', background: 'var(--accent-blue)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '0.75rem', color: '#fff', letterSpacing: '-0.03em'
                        }}>AI</div>
                        <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.04em' }}>HRMS</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Link to="/login" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', transition: 'color 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                            Log in
                        </Link>
                        <Link to="/register" className="btn btn-primary">Sign up</Link>
                    </div>
                </div>
            </motion.nav>

            {/* Hero */}
            <section style={{ paddingTop: '10rem', paddingBottom: '6rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '10%', right: '10%', width: 500, height: 500, background: 'var(--accent-blue)', filter: 'blur(180px)', opacity: 0.15, borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: 400, height: 400, background: 'var(--accent-purple)', filter: 'blur(150px)', opacity: 0.1, borderRadius: '50%', pointerEvents: 'none' }} />

                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.1 }}>
                        <p style={{
                            display: 'inline-block', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-default)',
                            padding: '0.35rem 1rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-purple)',
                            marginBottom: '1.5rem', letterSpacing: '0.02em'
                        }}>Intelligent Workspace 2.0</p>

                        <h1 style={{
                            fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900, letterSpacing: '-0.05em',
                            lineHeight: 1.05, marginBottom: '1.5rem'
                        }}>
                            Next-gen HR,<br />
                            powered by <span style={{ color: 'var(--accent-blue)' }}>AI.</span>
                        </h1>

                        <p style={{
                            fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', maxWidth: 640,
                            margin: '0 auto 2.5rem', lineHeight: 1.6, fontWeight: 400
                        }}>
                            Automate task assignments, discover hidden skill gaps, and manage your workforce with an editorial bento-box design system.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                                Get Started Free
                            </Link>
                            <Link to="/login" className="btn btn-ghost" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                                View Demo
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features (Bento Grid) */}
            <section style={{ padding: '6rem 0', borderTop: '1px solid var(--border-default)', background: 'var(--bg-card)' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
                    <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                        style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1rem' }}>
                            Everything you need.
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Simple, reliable, and beautifully designed tools.</p>
                    </motion.div>

                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem'
                    }}>
                        {features.map((feature, i) => (
                            <motion.div key={i} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                                style={{
                                    background: 'var(--bg-base)', border: '1px solid var(--border-default)',
                                    borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                                    transition: 'transform 0.2s', cursor: 'default'
                                }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{
                                    width: 48, height: 48, borderRadius: '14px', background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{feature.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <footer style={{ padding: '3rem 0', textAlign: 'center', borderTop: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <p>© 2026 AI-HRMS Inc. All rights reserved.</p>
            </footer>
        </div>
    )
}
