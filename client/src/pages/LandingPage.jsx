import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BrainCircuit, Users, CheckCircle, BarChart3, ShieldCheck } from 'lucide-react'

const features = [
    {
        title: "AI-Powered Insights",
        description: "Analyze employee productivity and predict skill gaps instantly.",
        icon: <BrainCircuit className="w-6 h-6 text-indigo-400" />
    },
    {
        title: "Smart Task Assignment",
        description: "Automatically match tasks to the best-suited employees.",
        icon: <CheckCircle className="w-6 h-6 text-indigo-400" />
    },
    {
        title: "Employee Management",
        description: "Keep track of your entire workforce in one unified dashboard.",
        icon: <Users className="w-6 h-6 text-indigo-400" />
    },
    {
        title: "Real-time Analytics",
        description: "Data-driven decisions with real-time tracking and metrics.",
        icon: <BarChart3 className="w-6 h-6 text-indigo-400" />
    },
    {
        title: "Web3 Verification",
        description: "Log completed tasks immutably on the Polygon blockchain.",
        icon: <ShieldCheck className="w-6 h-6 text-indigo-400" />
    }
]

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-indigo-500/30">
            {/* Header / Navbar */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="fixed w-full top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-500/20">
                            AI
                        </div>
                        <span className="font-bold text-lg tracking-tight">AI-HRMS</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                            Log in
                        </Link>
                        <Link to="/register" className="text-sm font-medium bg-white text-gray-950 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                            Sign up
                        </Link>
                    </div>
                </div>
            </motion.header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                            Next-gen HR, <br className="hidden md:block" /> powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Intelligence</span>.
                        </h1>
                        <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed mb-10">
                            Automate task assignments, discover hidden skill gaps, and manage your workforce with the world's first AI-native HR management system.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link to="/register" className="bg-indigo-600 text-white px-8 py-3.5 rounded-full font-medium hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                                Get Started Free <span className="text-xl leading-none">→</span>
                            </Link>
                            <Link to="/login" className="text-gray-300 hover:text-white font-medium px-8 py-3.5 transition-colors border border-gray-800 rounded-full hover:bg-gray-900">
                                View Demo
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-gray-900/50 border-t border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl font-bold tracking-tight">Everything you need to manage people.</h2>
                        <p className="mt-4 text-gray-400 font-light">Simple, reliable, and intelligent tools.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-gray-800/40 border border-gray-700/50 p-6 rounded-2xl hover:bg-gray-800/60 transition-colors"
                            >
                                <div className="w-12 h-12 bg-gray-900 border border-gray-700/50 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-800">
                <p>© 2026 AI-HRMS Inc. All rights reserved.</p>
            </footer>
        </div>
    )
}
