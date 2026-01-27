'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageCircle, Mic, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface WhatsAppWidgetProps {
    avatarUrl?: string;
}

// Sub-component for individual messages to handle own state
const MessageItem = ({ msg }: { msg: Message }) => {
    const [expanded, setExpanded] = useState(false);
    const CHAR_LIMIT = 400; // Adjusted limit
    const isLong = msg.content.length > CHAR_LIMIT;

    const displayContent = (!expanded && isLong) ? msg.content.slice(0, CHAR_LIMIT) + '...' : msg.content;

    return (
        <div className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`
                      max-w-[85%] rounded-lg px-3 py-2 text-[14px] shadow-sm relative
                      ${msg.role === 'user' ? 'bg-[#D9FDD3] rounded-tr-none' : 'bg-white rounded-tl-none'}
                    `}
            >
                <div className="text-gray-800 leading-relaxed markdown-content break-words">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-[#027eb5] hover:underline break-all" />,
                            ul: ({ node, ...props }) => <ul {...props} className="list-disc ml-4 my-1" />,
                            ol: ({ node, ...props }) => <ol {...props} className="list-decimal ml-4 my-1" />,
                            li: ({ node, ...props }) => <li {...props} className="my-0.5" />,
                            p: ({ node, ...props }) => <p {...props} className="mb-1 last:mb-0" />
                        }}
                    >
                        {displayContent}
                    </ReactMarkdown>

                    {!expanded && isLong && (
                        <button
                            onClick={() => setExpanded(true)}
                            className="text-[#007bfc] text-[13px] font-medium mt-1 hover:underline ml-1 block"
                        >
                            Read more
                        </button>
                    )}
                </div>
                <span className="text-[10px] text-gray-500 float-right mt-1 ml-2 flex items-center gap-1">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.role === 'user' && <span className="text-blue-500">✓✓</span>}
                </span>
            </div>
        </div>
    );
};

export default function WhatsAppWidget({ avatarUrl }: WhatsAppWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hey! I'm Aditya's AI assistant. Ask me anything about his projects, skills, or experience! 👋" }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load session from localStorage
    useEffect(() => {
        console.log("WhatsAppWidget Loaded - Markdown Support Active");
        const savedSession = localStorage.getItem('chat_session_id');
        if (savedSession) setSessionId(savedSession);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg = inputText;
        setInputText('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await axios.post('/api/chat', {
                message: userMsg,
                sessionId
            });

            if (res.data.sessionId && !sessionId) {
                setSessionId(res.data.sessionId);
                localStorage.setItem('chat_session_id', res.data.sessionId);
            }

            setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
        } catch (error) {
            toast.error('Failed to send message');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 p-4 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#20bd5a] transition-all ${isOpen ? 'hidden' : 'flex'}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <MessageCircle size={32} />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 z-50 w-full h-[100dvh] md:h-[600px] md:w-[380px] bg-[#EFEAE2] md:rounded-[18px] shadow-2xl overflow-hidden flex flex-col font-sans"
                    >
                        {/* Header */}
                        <div className="bg-[#008069] p-3 flex items-center justify-between shadow-sm shrink-0 z-10">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="md:hidden text-white mr-1"
                                >
                                    <X />
                                </button>
                                <div className="relative">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border border-white/20">
                                        <img src={avatarUrl || "/me.png"} alt="Aditya" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://github.com/shadcn.png'} />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#008069]"></div>
                                </div>
                                <div className="text-white">
                                    <h3 className="font-medium text-[16px] leading-tight filter drop-shadow-sm">Aditya Pandey</h3>
                                    <p className="text-[12px] opacity-80">Online</p>
                                </div>
                            </div>
                            <div className="flex gap-4 text-white/80 shrink-0">
                                <Video
                                    size={22}
                                    className="cursor-pointer hover:text-white"
                                    onClick={() => setMessages(prev => [...prev, { role: 'assistant', content: "I'm currently coding! Let's chat here instead. 💻" }])}
                                />
                                <Phone
                                    size={20}
                                    className="cursor-pointer hover:text-white"
                                    onClick={() => setMessages(prev => [...prev, { role: 'assistant', content: "Can't take calls right now. Text me! 📱" }])}
                                />
                                <button onClick={() => setIsOpen(false)} className="hidden md:block hover:text-white">
                                    <X size={22} />
                                </button>
                            </div>
                        </div>

                        {/* Chat Area (Background Pattern) */}
                        <div
                            className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat"
                        >
                            {/* Encryption Notice */}
                            <div className="flex justify-center mb-4">
                                <div className="bg-[#FFF5C4] text-[#5E5E5E] text-[11px] px-3 py-1.5 rounded-lg shadow-sm text-center max-w-[85%]">
                                    🔒 Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
                                </div>
                            </div>

                            {messages.map((msg, idx) => (
                                <MessageItem key={idx} msg={msg} />
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white rounded-lg rounded-tl-none px-4 py-3 shadow-sm">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="bg-[#F0F2F5] p-3 flex items-center gap-2 shrink-0">
                            <button className="text-gray-500 hover:text-gray-700">
                                <MoreVertical size={24} className="rotate-90" />
                            </button>
                            <button className="text-gray-500 hover:text-gray-700">
                                <Paperclip size={22} />
                            </button>
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message"
                                className="flex-1 bg-white rounded-lg px-4 py-2 text-sm text-black focus:outline-none border-none placeholder-gray-500"
                            />

                            {inputText.trim() ? (
                                <button
                                    onClick={sendMessage}
                                    className="p-2 bg-[#008069] text-white rounded-full hover:bg-[#006e5a] transition-colors"
                                >
                                    <Send size={20} />
                                </button>
                            ) : (
                                <button className="text-gray-500 hover:text-gray-700 p-2">
                                    <Mic size={24} />
                                </button>
                            )}
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
