'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function AdminChatsPage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState<any | null>(null);
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await axios.get('/api/admin/chats');
            setSessions(res.data);
        } catch (error) {
            toast.error('Failed to load chats');
        }
    };

    const handleSelectSession = (session: any) => {
        setSelectedSession(session);
        setSummary(null); // Reset summary
    };

    const generateSummary = async () => {
        if (!selectedSession) return;
        setIsSummarizing(true);
        try {
            const res = await axios.post(`/api/admin/chats/${selectedSession.id}/summarize`);
            setSummary(res.data.summary);
        } catch (error) {
            toast.error('Failed to generate summary');
        } finally {
            setIsSummarizing(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold">Active Chats</h2>
                    <button onClick={fetchSessions} className="text-sm text-blue-500 hover:underline">Refresh</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            onClick={() => handleSelectSession(session)}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedSession?.id === session.id ? 'bg-blue-50' : ''}`}
                        >
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-800">{session.userName}</span>
                                <span className="text-xs text-gray-400">
                                    {new Date(session.updatedAt).toLocaleTimeString()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                                {session?.messages?.[0]?.content || "No messages yet"}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat View */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedSession ? (
                    <>
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 shadow-sm">
                            <div>
                                <h2 className="font-bold text-lg">{selectedSession.userName}</h2>
                                <p className="text-xs text-gray-500">ID: {selectedSession.id}</p>
                            </div>
                            <button
                                onClick={generateSummary}
                                disabled={isSummarizing}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 shadow-sm"
                            >
                                {isSummarizing ? 'Summarizing...' : 'Summarize Chat'}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-100">
                            {/* Summary Card */}
                            {summary && (
                                <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4 shadow-sm">
                                    <h3 className="text-purple-800 font-bold mb-2">✨ AI Summary</h3>
                                    <p className="text-purple-700 text-sm whitespace-pre-wrap leading-relaxed">{summary}</p>
                                </div>
                            )}

                            {/* Messages */}
                            {selectedSession.messages?.map((msg: any) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                    <div
                                        className={`max-w-[70%] rounded-lg px-4 py-3 shadow-sm ${msg.role === 'user' ? 'bg-white border border-gray-200 text-gray-800' : 'bg-blue-600 text-white'
                                            }`}
                                    >
                                        <p className="text-sm">{msg.content}</p>
                                        <span className={`text-[10px] mt-1 block ${msg.role === 'user' ? 'text-gray-400' : 'text-blue-200'}`}>
                                            {new Date(msg.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 flex-col">
                        <p>Select a chat session to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}
