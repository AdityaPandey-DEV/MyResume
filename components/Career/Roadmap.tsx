'use client'

import { useQuery } from '@tanstack/react-query'
import axios from '@/lib/axios'
import { motion } from 'framer-motion'

export default function Roadmap() {
    const { data: roadmap, isLoading } = useQuery({
        queryKey: ['roadmap'],
        queryFn: async () => {
            const res = await axios.get('/career/roadmap')
            return res.data.items || []
        }
    })

    if (isLoading || !roadmap || roadmap.length === 0) return null

    return (
        <section id="roadmap" className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight uppercase">
                        Career <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Roadmap</span>
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
                        A visual timeline of my professional milestones and upcoming goals.
                    </p>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Vertical Line */}
                    <div className="absolute left-8 md:left-1/2 md:-ml-0.5 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-100 via-indigo-100 to-transparent"></div>

                    <div className="space-y-16">
                        {roadmap.map((item: any, idx: number) => {
                            const isEven = idx % 2 === 0
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`relative flex items-center justify-between md:justify-normal md:gap-14 ${isEven ? 'md:flex-row-reverse' : ''}`}
                                >
                                    {/* Content Container */}
                                    <div className={`w-[calc(100%-4rem)] md:w-1/2 p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:border-blue-100 bg-white group ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                                        <div className={`flex items-center gap-3 mb-3 ${isEven ? '' : 'md:flex-row-reverse'}`}>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${item.type === 'skill' ? 'bg-blue-50 text-blue-600' :
                                                    item.type === 'job' ? 'bg-purple-50 text-purple-600' :
                                                        item.type === 'certificate' ? 'bg-orange-50 text-orange-600' :
                                                            'bg-gray-100 text-gray-500'
                                                }`}>
                                                {item.type}
                                            </span>
                                            {item.targetDate && (
                                                <span className="text-xs font-bold text-gray-400 font-mono italic">{item.targetDate}</span>
                                            )}
                                        </div>
                                        <h3 className={`text-xl font-black text-gray-800 mb-2 ${item.isCompleted ? 'line-through text-gray-400' : ''}`}>
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm leading-relaxed font-medium">{item.description}</p>

                                        {item.isCompleted && (
                                            <div className={`flex mt-4 ${isEven ? '' : 'md:justify-end'}`}>
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                    <i className="fas fa-check-circle"></i> Accomplished
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Icon Node */}
                                    <div className={`absolute left-8 md:left-1/2 translate-x-[-50%] w-5 h-5 rounded-full border-4 border-white shadow-md z-10 transition-all group-hover:scale-125 ${item.isCompleted ? 'bg-green-500' : 'bg-blue-600 ring-8 ring-blue-50'}`}></div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
