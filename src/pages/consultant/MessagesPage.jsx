import { useState } from 'react'

const conversations = [
    {
        id: 1,
        name: 'Elena Rodriguez',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_QqhFD3qjUqZnVWfDZl5aq4DMMtmKK5sxBuGt4WcdeVfMxLHo3IrkZVEw5Uq6otKxGI5QQPXOg1cY3wSjIKWuWF1Xav-4RK7dwwJ5xTjTZmUsfku0gpBRO_z9VWzZStQQohIYfvpfwCVmSu-rGCK7YiFStrLS-NU8bIXqxBLf5MfoKBeIjkBMLdKcq2Q8_SecxViBKZba77p3eVd4Vp8_G-nq9krPfJvM5Z9GwGcWARQ0zIUwtW3Pi0TVqvYA9Mjl78glXOol-Fs',
        lastMessage: "I've uploaded the marriage certificate as requested.",
        time: '10:42 AM',
        status: 'online',
        caseType: 'Family Sponsorship Case',
        unread: false,
        isActive: true
    },
    {
        id: 2,
        name: 'Michael Chen',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlAnchK3o6PZQArYdvZx9g4f21B3-qKwWvx99pxzfCYv196c50YJ1oCNLxIegLuMX-9WZF2LEjG-A0YGkajn5BhRPLjAYlD0N_O_volsg87sNjEdfcIjD8PqkpGks4fDHHR6Rfxl5ttopxAcbCZ6rmnyoaXcfnQ-msnGoyE70AetScJYNiLJ2eunPjy_CsG510CJvS6orNSA0BpKC2_T0lsRqc4HaT_qY_Gpc5b5VIikDfqW5FOzmrBUTH9oiKfqtrF2L5ckMG8u4',
        lastMessage: 'Thanks for the update on the skilled worker visa.',
        time: 'Yesterday',
        status: 'offline',
        caseType: 'Skilled Worker Visa',
        unread: false
    },
    {
        id: 3,
        name: 'James Wilson',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArTvHy8gxpFLLbaFnBJ0bkc_PCfJGlXvIAGmZ8-dr9ggk4YBsuCiyUmykNIQnSOYpnU9tsMVH6yc-b54saVk-2lWJOFJkhoTi-Q8aSN2XjKId2fvLH_p9wxIqTRYeely-u9NawrkQdeyFCb8dmlVvQwLFmqRe2a9q7pSn8G-rhV4SktlomgUk4puS7hUgepby2crmGxAR-GoLLPAihWG69eEv7tzqiFyyKvtQUXqKZ2R37OiKN29cLTbZCcQ3rDFdwmKOiBLCGXZ4',
        lastMessage: 'Can we reschedule our meeting to Friday?',
        time: 'Tue',
        status: 'away',
        caseType: 'Consultation',
        unread: true
    },
    {
        id: 4,
        name: 'Sarah Jenkins',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNEDi66eGzRJ4XdbSb5a3HA2J9t6UGn-vEqcA1wLAsBPoRYooBwozyCyiA-eHrygeQMRcf0akhdQmiiyjCYntidLRrfW3qI4P75FvDHXL2N7TsU4cPJrG9TWVhpkZh0FDiip7I4DkVXSa1acRdy2zIl1FA0CBuIjbw7Vgx0SE7TdMdE7L078lBkqEWrfV1i6v0jXleRSbF5YdXpO18UGg63kVHR5RsMOg9EIrOmiXYCran8jld4ZIDwmeJywWTLfQDhp15p4v5QVo',
        lastMessage: 'Is there any update on the study permit application?',
        time: 'Oct 20',
        status: 'offline',
        caseType: 'Student Visa',
        unread: false
    },
    {
        id: 5,
        name: 'David Smith',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDknjbKrqVgKLMzErVgV8hOgKRvUKE0UTjzC2QydgRXonWVQg86bmcOZ8w95IFKgWtH8KvtaNShQwj--d2AoFe5vlR9GbU8VmDAEEwLu6r576pInRdVxetouQ7L7YGNot1yqL_9xxtq4ipyl4sB8zuJ-KjzlMC9GYQWBmZn0liUblk9NM-AHnWjRSyspn8Euibtb3ogXdSITXBjIz5M2HxLF-OWIHw9vl7XYgeC38doDHA_MttbP90u22OmHj3aHkvDpBRRNPbh3PM',
        lastMessage: 'Documentation sent via email.',
        time: 'Oct 18',
        status: 'offline',
        caseType: 'Family Sponsorship',
        unread: false
    }
]

const messages = [
    {
        id: 1,
        sender: 'client',
        text: 'Hi Alex, hope you\'re doing well. I had a quick question about the financial proof documents.',
        time: '09:30 AM'
    },
    {
        id: 2,
        sender: 'consultant',
        text: 'Hello Elena! I\'m good, thanks. Sure, what specifically would you like to know about the financial proofs?',
        time: '09:35 AM'
    },
    {
        id: 3,
        sender: 'client',
        text: 'Does the bank statement need to be stamped by the bank, or is an online PDF download sufficient?',
        time: '10:40 AM'
    },
    {
        id: 4,
        sender: 'client',
        text: 'Also, I\'ve just uploaded the translated marriage certificate. Please take a look when you have a moment.',
        time: '10:41 AM'
    },
    {
        id: 5,
        sender: 'client',
        text: null,
        attachment: {
            name: 'Marriage_Certificate_Trans...pdf',
            size: '2.4 MB',
            type: 'PDF Document'
        },
        time: '10:42 AM'
    }
]

const consultantAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9HdQVrXnYXJA841XZVdoUTho3DJF3AxB9zQdmOpQrAiw_LeuLQCrvE7I9mn9xXG3s4qXAPL7k3EJ35M8fvMa5frO3y75gdyFt9nDH72napRfKzqeikVUXYGkIXLA2OwajgY0Eh1HKGSGbMJUKcotv4vTHRRvm604zEmYsCFXk1TrGeWwplwHkvrg02gV6b8VMGax5B2Uz7K1YHOs1Ae3LrYS9g6dpP2q2eE1CM99ndBwQ9SezmOQHFLLe9QXnzN4krqNNT5hV1rw'

export default function MessagesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedConversation, setSelectedConversation] = useState(conversations[0])
    const [messageText, setMessageText] = useState('')

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'bg-green-500'
            case 'away': return 'bg-amber-500'
            default: return 'bg-slate-300'
        }
    }

    const filteredConversations = conversations.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex h-[calc(100vh-8rem)] -m-4 lg:-m-8">
            {/* Conversations Sidebar */}
            <aside className="w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-full">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h2>
                        <button className="text-primary hover:bg-primary/5 p-1.5 rounded-full transition-colors">
                            <span className="material-symbols-outlined">edit_square</span>
                        </button>
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search clients..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredConversations.map((conversation) => (
                        <div
                            key={conversation.id}
                            onClick={() => setSelectedConversation(conversation)}
                            className={`flex gap-3 items-center p-3 rounded-xl cursor-pointer transition-colors group ${selectedConversation.id === conversation.id
                                    ? 'bg-primary/5 border border-primary/10'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <div className="relative">
                                <div
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12"
                                    style={{ backgroundImage: `url("${conversation.avatar}")` }}
                                ></div>
                                <span className={`absolute bottom-0 right-0 size-3 ${getStatusColor(conversation.status)} border-2 border-white dark:border-slate-900 rounded-full`}></span>
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className={`font-bold text-sm truncate ${selectedConversation.id === conversation.id
                                            ? 'text-slate-900 dark:text-white'
                                            : 'text-slate-900 dark:text-white group-hover:text-primary transition-colors'
                                        }`}>
                                        {conversation.name}
                                    </h3>
                                    <span className={`text-xs ${conversation.unread || selectedConversation.id === conversation.id
                                            ? 'font-semibold text-primary'
                                            : 'text-slate-400'
                                        }`}>
                                        {conversation.time}
                                    </span>
                                </div>
                                <p className={`text-xs truncate ${conversation.unread
                                        ? 'font-semibold text-slate-900 dark:text-white'
                                        : 'text-slate-500 dark:text-slate-500'
                                    }`}>
                                    {conversation.lastMessage}
                                </p>
                            </div>
                            {conversation.unread && (
                                <div className="size-2 bg-primary rounded-full flex-shrink-0"></div>
                            )}
                        </div>
                    ))}
                </div>
            </aside>

            {/* Chat Area */}
            <section className="hidden md:flex flex-col flex-1 bg-background-light dark:bg-background-dark h-full relative">
                {/* Chat Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 z-10">
                    <div className="flex items-center gap-3">
                        <div
                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                            style={{ backgroundImage: `url("${selectedConversation.avatar}")` }}
                        ></div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white">{selectedConversation.name}</h2>
                            <div className="flex items-center gap-1.5">
                                <span className={`size-2 rounded-full ${getStatusColor(selectedConversation.status)}`}></span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {selectedConversation.status === 'online' ? 'Active now' : 'Offline'} • {selectedConversation.caseType}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="View Profile">
                            <span className="material-symbols-outlined">person</span>
                        </button>
                        <button className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Start Video Call">
                            <span className="material-symbols-outlined">videocam</span>
                        </button>
                        <button className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="More Options">
                            <span className="material-symbols-outlined">more_vert</span>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                    {/* Date Divider */}
                    <div className="flex justify-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                            Today, Oct 24
                        </span>
                    </div>

                    {/* Messages */}
                    {messages.map((message) => (
                        <div key={message.id} className={`flex gap-4 max-w-2xl ${message.sender === 'consultant' ? 'flex-row-reverse ml-auto' : ''}`}>
                            <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 flex-shrink-0 mt-1"
                                style={{ backgroundImage: `url("${message.sender === 'consultant' ? consultantAvatar : selectedConversation.avatar}")` }}
                            ></div>
                            <div className={`flex flex-col gap-1 ${message.sender === 'consultant' ? 'items-end' : ''}`}>
                                {message.text && (
                                    <div className={`p-4 shadow-sm ${message.sender === 'consultant'
                                            ? 'bg-primary text-white rounded-2xl rounded-tr-none shadow-md'
                                            : 'bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700'
                                        }`}>
                                        <p className={`text-sm leading-relaxed ${message.sender === 'consultant' ? '' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {message.text}
                                        </p>
                                    </div>
                                )}
                                {message.attachment && (
                                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 w-fit hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group">
                                        <div className="size-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-500">
                                            <span className="material-symbols-outlined">picture_as_pdf</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                                {message.attachment.name}
                                            </span>
                                            <span className="text-xs text-slate-500">{message.attachment.size} • {message.attachment.type}</span>
                                        </div>
                                        <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                            <span className="material-symbols-outlined">download</span>
                                        </button>
                                    </div>
                                )}
                                <span className={`text-[10px] text-slate-400 ${message.sender === 'consultant' ? 'mr-1' : 'ml-1'}`}>
                                    {message.time}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col gap-2 max-w-4xl mx-auto">
                        <div className="flex items-center gap-1 px-1">
                            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Attach File">
                                <span className="material-symbols-outlined text-[20px]">attach_file</span>
                            </button>
                            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Request Document">
                                <span className="material-symbols-outlined text-[20px]">post_add</span>
                            </button>
                            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Insert Template">
                                <span className="material-symbols-outlined text-[20px]">article</span>
                            </button>
                        </div>
                        <div className="flex gap-3 items-end bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
                            <textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                placeholder="Type your message here..."
                                rows={1}
                                className="w-full bg-transparent border-none p-0 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 resize-none max-h-32 min-h-[24px]"
                            />
                            <button className="bg-primary hover:bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center transition-colors shadow-sm">
                                <span className="material-symbols-outlined text-[20px]">send</span>
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-slate-400 mt-1">Press Enter to send, Shift + Enter for new line</p>
                    </div>
                </div>
            </section>
        </div>
    )
}
