
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
// Ensure you have chart.js or similar installed. For now using basic CSS/HTML bars to avoid heavy deps, 
// or simpler SVG if possible. A "FAANG Level" usually implies slick animations.

interface DSAStats {
    platform: string;
    solved: number;
    easy: number;
    medium: number;
    hard: number;
    rating?: number;
    rank?: string;
    globalRank?: number;
}

export default function DSASection() {
    const [leetcode, setLeetcode] = useState<DSAStats | null>(null)
    const [codeforces, setCodeforces] = useState<DSAStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch from our internal API which reads from DB
                // We'll create a public route for this or just use server actions/client fetch
                // For now simulating with a direct fetch to a new route we need to make: /api/stats
                const res = await fetch('/api/stats')
                const data = await res.json()
                setLeetcode(data.leetcode)
                setCodeforces(data.codeforces)
            } catch (e) {
                console.error("Failed to fetch stats")
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) return <div className="py-20 text-center">Loading DSA Stats...</div>

    if (!leetcode && !codeforces) return null; // Or return a placeholder

    return (
        <section className="py-20 bg-black text-white overflow-hidden relative" id="dsa">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-[100px]" />
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                        Data Structures & Algorithms
                    </h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Problem solving journey across major competitive programming platforms.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* LeetCode Card */}
                    {leetcode && (
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold flex items-center gap-2">
                                        <span className="text-yellow-500">LeetCode</span>
                                    </h3>
                                    <span className="text-gray-400 text-sm">Global Rank: {leetcode.globalRank || 'N/A'}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white">{leetcode.solved}</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">Solved</div>
                                </div>
                            </div>

                            {/* Progress Bars */}
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-400">Easy</span>
                                        <span className="text-gray-400">{leetcode.easy}</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${(leetcode.easy / (leetcode.solved || 1)) * 100}%` }}
                                            className="h-full bg-green-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-yellow-400">Medium</span>
                                        <span className="text-gray-400">{leetcode.medium}</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${(leetcode.medium / (leetcode.solved || 1)) * 100}%` }}
                                            className="h-full bg-yellow-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-red-400">Hard</span>
                                        <span className="text-gray-400">{leetcode.hard}</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${(leetcode.hard / (leetcode.solved || 1)) * 100}%` }}
                                            className="h-full bg-red-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Codeforces Card */}
                    {codeforces && (
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold flex items-center gap-2">
                                        <span className="text-blue-500">Codeforces</span>
                                    </h3>
                                    <span className="text-gray-400 text-sm">Rank: {codeforces.rank || 'Unrated'}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-white">{codeforces.rating || 0}</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-wider">Current Rating</div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-gray-400 text-sm">Max Rating</span>
                                    <span className="text-xl font-bold text-purple-400">{codeforces.rating}</span>
                                    {/* Note: simplistic, ideally we show a graph here if we stored history */}
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${Math.min(((codeforces.rating || 0) / 3000) * 100, 100)}%` }} // 3000 as arbitrary max for visual
                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                                    />
                                </div>
                                <p className="mt-4 text-sm text-gray-500">
                                    Participated in competitive contests to hone algorithmic thinking under pressure.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    )
}
