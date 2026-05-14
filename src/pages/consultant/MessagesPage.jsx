import { useState, useEffect, useRef, useCallback } from 'react'
import Avatar from '../../components/ui/Avatar'
import { useMessages } from '../../hooks/useMessages'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

function formatMsgTime(d) {
    if (!d) return ''
    const date = new Date(d)
    const today = new Date()
    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function MessagesPage() {
    const { user } = useAuth()
    const { conversations, messages, loading, sendMessage, unreadCount } = useMessages()
    const [activeConv, setActiveConv] = useState(null)
    const [threadMessages, setThreadMessages] = useState([])
    const [threadLoading, setThreadLoading] = useState(false)
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [search, setSearch] = useState('')
    const bottomRef = useRef(null)

    const filteredConvs = conversations.filter(c =>
        c.other?.full_name?.toLowerCase().includes(search.toLowerCase())
    )

    const fetchThread = useCallback(async (otherId) => {
        setThreadLoading(true)
        const { data } = await supabase
            .from('messages')
            .select('*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)')
            .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${user.id})`)
            .order('created_at', { ascending: true })
        setThreadMessages(data || [])
        // Mark as read
        await supabase.from('messages')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('recipient_id', user.id)
            .eq('sender_id', otherId)
            .eq('is_read', false)
        setThreadLoading(false)
    }, [user?.id])

    useEffect(() => {
        if (activeConv) fetchThread(activeConv.otherId)
    }, [activeConv, fetchThread])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [threadMessages])

    // Real-time: append new messages to thread
    useEffect(() => {
        if (!user) return
        const channel = supabase
            .channel(`messages-thread-${user.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `recipient_id=eq.${user.id}`,
            }, async (payload) => {
                if (activeConv && payload.new.sender_id === activeConv.otherId) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url')
                        .eq('id', payload.new.sender_id)
                        .single()
                    setThreadMessages(prev => [...prev, { ...payload.new, sender: data }])
                }
            })
            .subscribe()
        return () => supabase.removeChannel(channel)
    }, [user, activeConv])

    const handleSend = async () => {
        if (!newMessage.trim() || !activeConv) return
        setSending(true)
        const { data } = await sendMessage({ recipientId: activeConv.otherId, content: newMessage })
        if (data) {
            setThreadMessages(prev => [...prev, { ...data, sender: { id: user.id } }])
        }
        setNewMessage('')
        setSending(false)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Messages</h2>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-primary text-white text-xs font-bold">{unreadCount}</span>
                        )}
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3">
                                <div className="size-10 rounded-full animate-pulse bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 animate-pulse rounded bg-slate-200 dark:bg-slate-700 w-2/3" />
                                    <div className="h-2.5 animate-pulse rounded bg-slate-100 dark:bg-slate-800 w-full" />
                                </div>
                            </div>
                        ))
                    ) : filteredConvs.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                            <span className="material-symbols-outlined text-[36px]">chat_bubble_outline</span>
                            <p className="text-sm">No conversations yet</p>
                        </div>
                    ) : filteredConvs.map(conv => (
                        <button
                            key={conv.otherId}
                            onClick={() => setActiveConv(conv)}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${activeConv?.otherId === conv.otherId
                                ? 'bg-primary/10 dark:bg-primary/10 border-l-2 border-primary'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-2 border-transparent'
                            }`}
                        >
                            <div className="relative flex-shrink-0">
                                <Avatar src={conv.other?.avatar_url} alt={conv.other?.full_name} size="sm" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline justify-between">
                                    <span className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                                        {conv.other?.full_name || 'Unknown'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 flex-shrink-0 ml-1">{formatMsgTime(conv.lastMessage?.created_at)}</span>
                                </div>
                                <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? 'text-slate-600 dark:text-slate-300 font-medium' : 'text-slate-400'}`}>
                                    {conv.lastMessage?.content || ''}
                                </p>
                            </div>
                            {conv.unreadCount > 0 && (
                                <span className="flex-shrink-0 size-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                                    {conv.unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Thread Panel */}
            {activeConv ? (
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Thread Header */}
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <Avatar src={activeConv.other?.avatar_url} alt={activeConv.other?.full_name} size="sm" />
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{activeConv.other?.full_name}</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                        {threadLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                                    <div className="h-10 w-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                                </div>
                            ))
                        ) : threadMessages.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-16 text-slate-400">
                                <span className="material-symbols-outlined text-[48px]">forum</span>
                                <p className="text-sm">Start a conversation</p>
                            </div>
                        ) : threadMessages.map(msg => {
                            const isMe = msg.sender_id === user.id
                            return (
                                <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {!isMe && (
                                        <Avatar src={msg.sender?.avatar_url} alt={msg.sender?.full_name} size="xs" />
                                    )}
                                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isMe
                                        ? 'bg-primary text-white rounded-br-sm'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm'
                                    }`}>
                                        <p className="text-sm leading-relaxed">{msg.content}</p>
                                        <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                                            {formatMsgTime(msg.created_at)}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="flex items-end gap-3">
                            <textarea
                                rows={1}
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={`Message ${activeConv.other?.full_name?.split(' ')[0] || ''}...`}
                                className="flex-1 resize-none border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-primary focus:outline-none"
                            />
                            <button
                                onClick={handleSend}
                                disabled={sending || !newMessage.trim()}
                                className="flex-shrink-0 size-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[20px]">send</span>
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1.5">Press Enter to send, Shift+Enter for new line</p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-[64px] mb-4">chat_bubble_outline</span>
                    <p className="text-base font-medium">Select a conversation</p>
                    <p className="text-sm mt-1">Choose from your messages on the left</p>
                </div>
            )}
        </div>
    )
}
