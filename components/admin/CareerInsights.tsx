'use client'

import { useState, useEffect } from 'react'

type Analysis = {
    holisticPersona: string
    strengths: string[]
    gaps: string[]
    topTechStack: string[]
    suggestedFocus: string
}

type Suggestion = {
    id: string
    type: string
    title: string
    description: string
    difficulty: string
    relevanceScore: number
    actionUrl: string
}

export default function CareerInsights() {
    const [analysis, setAnalysis] = useState<Analysis | null>(null)
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const fetchInsights = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/career/data') // We'll need this route to just GET existing
            const data = await res.json()
            if (data.success) {
                setAnalysis(data.analysis)
                setSuggestions(data.suggestions)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    const generateInsights = async () => {
        setIsGenerating(true)
        try {
            const res = await fetch('/api/career/suggestions') // This triggers new analysis
            const data = await res.json()
            if (data.success) {
                setAnalysis(data.analysis)
                setSuggestions(data.suggestions)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsGenerating(false)
        }
    }

    useEffect(() => {
        fetchInsights()
    }, [])

    const addSkill = async (title: string, type: string) => {
        try {
            const res = await fetch('/api/career/add-skill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, type })
            })
            const data = await res.json()
            if (data.success) {
                alert(`${title} added to your skills (Learning mode). You can activate it in the Tools & Settings tab once you feel ready!`)
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">AI Career Advisor</h2>
                    <p className="text-gray-600">Personalized professional growth insights based on your entire profile.</p>
                </div>
                <button
                    onClick={generateInsights}
                    disabled={isGenerating}
                    className={`px-6 py-2 rounded-lg font-bold text-white shadow-lg transition-all flex items-center gap-2 ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:scale-105 active:scale-95'
                        }`}
                >
                    {isGenerating ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            <span>Analyzing Your Persona...</span>
                        </>
                    ) : (
                        <>
                            <i className="fas fa-brain"></i>
                            <span>Regenerate Insights</span>
                        </>
                    )}
                </button>
            </div>

            {analysis && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-sm">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="bg-white p-3 rounded-xl shadow-md text-blue-600">
                            <i className="fas fa-user-astronaut text-2xl"></i>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Your AI Professional Persona</h3>
                            <p className="text-blue-900 font-medium leading-relaxed italic mt-1">
                                &quot;{analysis.holisticPersona}&quot;
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 border border-white/40">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <i className="fas fa-bolt text-yellow-500"></i> Key Strengths
                            </h4>
                            <ul className="space-y-2">
                                {analysis.strengths.map((s, i) => (
                                    <li key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                                        <i className="fas fa-check-circle text-green-500"></i>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 border border-white/40">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <i className="fas fa-search text-red-500"></i> Impact Gaps
                            </h4>
                            <ul className="space-y-2">
                                {analysis.gaps.map((g, i) => (
                                    <li key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                                        <i className="fas fa-exclamation-circle text-red-400"></i>
                                        {g}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 border border-white/40">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <i className="fas fa-crosshairs text-blue-500"></i> Suggested Focus
                            </h4>
                            <p className="text-gray-700 text-sm font-medium leading-normal">
                                {analysis.suggestedFocus}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {analysis.topTechStack.map((t, i) => (
                                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold border border-blue-100">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {suggestions.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <i className="fas fa-rocket text-purple-600"></i> Recommended Upgrades
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {suggestions.map((s) => (
                            <div key={s.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${s.type === 'course' ? 'bg-green-50 text-green-600 border border-green-100' :
                                        s.type === 'skill' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                            s.type === 'dsa' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                                                'bg-orange-50 text-orange-600 border border-orange-100'
                                        }`}>
                                        {s.type}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-400">Relevance</span>
                                        <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${s.relevanceScore}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors uppercase">{s.title}</h4>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 italic">{s.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className={`text-xs font-bold ${s.difficulty === 'Beginner' ? 'text-green-500' :
                                        s.difficulty === 'Intermediate' ? 'text-orange-500' :
                                            'text-red-500'
                                        }`}>
                                        {s.difficulty}
                                    </span>
                                    {s.actionUrl && (
                                        <div className="flex gap-4">
                                            {s.type === 'trending' && (
                                                <button
                                                    onClick={() => addSkill(s.title, s.type)}
                                                    className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition"
                                                >
                                                    Start Learning
                                                </button>
                                            )}
                                            <a
                                                href={`https://www.google.com/search?q=${encodeURIComponent(s.title + " " + s.type)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
                                            >
                                                Explore <i className="fas fa-external-link-alt text-[10px]"></i>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isLoading && !isGenerating && suggestions.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <i className="fas fa-sparkles text-4xl text-gray-300 mb-4 block"></i>
                    <h3 className="text-lg font-bold text-gray-400 uppercase">No Insights Generated Yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">
                        Click the &quot;Regenerate Insights&quot; button to let Gemini analyze your profile and suggest your next big career move.
                    </p>
                </div>
            )}
        </div>
    )
}
