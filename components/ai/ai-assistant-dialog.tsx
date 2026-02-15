"use client"

import type React from "react"
import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Send,
    Mic,
    MicOff,
    Paperclip,
    Sparkles,
    Bot,
    Copy,
    Download,
    Volume2,
    VolumeX,
    Zap,
    Brain,
    MessageSquare,
    Code,
    PlusCircle,
    Share2,
    Calculator,
    Trash2,
    Menu,
    X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { UIMessage } from "ai"
import { v4 as uuidv4 } from "uuid"
import Image from "next/image"
import { saveConversation, getConversation, getAllConversations, deleteConversation, type Conversation } from "@/lib/db/indexedDB"

interface AIAssistantDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type ConversationMode = "general" | "shepherding" | "letters" | "ministry" | "meetings" | "reports"

const models = [
    { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
    { id: "gpt-4.5-preview", name: "GPT-4.5 Preview", provider: "openai" },
]

// AudioWaveIndicator component (re-used for global and individual speaking)
const AudioWaveIndicator: React.FC = () => (
    <div className="flex items-center space-x-0.5 h-4">
        <div className="w-1 h-full bg-blue-600 rounded-full animate-wave" style={{ animationDelay: "0s" }} />
        <div className="w-1 h-full bg-blue-600 rounded-full animate-wave" style={{ animationDelay: "0.1s" }} />
        <div className="w-1 h-full bg-blue-600 rounded-full animate-wave" style={{ animationDelay: "0.2s" }} />
        <div className="w-1 h-full bg-blue-600 rounded-full animate-wave" style={{ animationDelay: "0.3s" }} />
        <div className="w-1 h-full bg-blue-600 rounded-full animate-wave" style={{ animationDelay: "0.4s" }} />
    </div>
)

export function AIAssistantDialog({ username }: { username: string }) {
    const [mode, setMode] = useState<ConversationMode>("general")
    const [selectedModelId, setSelectedModelId] = useState(models[0].id)
    const [isListening, setIsListening] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)
    const [voiceEnabled, setVoiceEnabled] = useState(false)
    const [filesToUpload, setFilesToUpload] = useState<FileList | undefined>(undefined)
    const [showSidebar, setShowSidebar] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const [allConversations, setAllConversations] = useState<Conversation[]>([])
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)

    const stopSpeaking = useCallback(() => {
        if ("speechSynthesis" in window) {
            speechSynthesis.cancel()
            setIsSpeaking(false)
            setSpeakingMessageId(null) // Clear individual speaking message
        }
    }, [])

    const playMessage = useCallback(
        (messageId: string, content: string) => {
            if ("speechSynthesis" in window) {
                stopSpeaking() // Stop any ongoing speech first
                setSpeakingMessageId(messageId)
                const utterance = new SpeechSynthesisUtterance(content)
                utterance.rate = 0.9
                utterance.pitch = 1
                utterance.onstart = () => setIsSpeaking(true)
                utterance.onend = () => {
                    setIsSpeaking(false)
                    setSpeakingMessageId(null)
                }
                utterance.onerror = () => {
                    setIsSpeaking(false)
                    setSpeakingMessageId(null)
                }
                speechSynthesis.speak(utterance)
            }
        },
        [stopSpeaking],
    )

    const { messages, sendMessage, status, error, setMessages } = useChat({
        api: '/api/chat',
        body: { mode, selectedModelId, userId: username },
        onFinish: (options) => {
            console.log('onFinish called with:', options)
            if (voiceEnabled && "speechSynthesis" in window) {
                stopSpeaking()
                const content = typeof options.message.parts[0] === 'object' && 'text' in options.message.parts[0]
                    ? options.message.parts[0].text
                    : ''
                const utterance = new SpeechSynthesisUtterance(content)
                utterance.rate = 0.9
                utterance.pitch = 1
                utterance.onstart = () => setIsSpeaking(true)
                utterance.onend = () => setIsSpeaking(false)
                utterance.onerror = () => setIsSpeaking(false)
                speechSynthesis.speak(utterance)
            }
        },
        onError: (err) => {
            console.error('Chat error:', err)
        },
    })

    console.log('Current status:', status)
    console.log('Current messages count:', messages.length)

    const [input, setInput] = useState('')
    const isLoading = status === 'streaming' || status === 'submitted'

    // Log messages array to see its content on the client side
    useEffect(() => {
        if (messages.length > 0) {
            console.log('Messages updated:', messages)
            console.log('Last message parts:', messages[messages.length - 1]?.parts)
        }
    }, [messages])

    // Load conversations from IndexedDB on mount
    useEffect(() => {
        if (typeof window === "undefined") return

        const loadConversations = async () => {
            const allConvs = await getAllConversations()
            const urlParams = new URLSearchParams(window.location.search)
            const idFromUrl = urlParams.get("conversationId")

            let initialConv: Conversation | undefined
            let newCurrentId: string

            if (idFromUrl) {
                initialConv = await getConversation(idFromUrl)
            }

            if (initialConv) {
                newCurrentId = initialConv.id
                setMessages(initialConv.messages)
            } else {
                newCurrentId = uuidv4()
                const newConv: Conversation = {
                    id: newCurrentId,
                    messages: [],
                    createdAt: Date.now(),
                    title: "New Chat",
                }
                await saveConversation(newConv)
                setMessages([])
                window.history.replaceState(null, "", `?conversationId=${newCurrentId}`)
            }

            setAllConversations(allConvs)
            setCurrentConversationId(newCurrentId)
        }

        loadConversations()
    }, [setMessages])

    // Save messages to IndexedDB whenever they change
    useEffect(() => {
        if (!currentConversationId || messages.length === 0) return

        const saveMessages = async () => {
            const existingConv = await getConversation(currentConversationId)
            const title = existingConv?.title === "New Chat" && messages.length > 0 && messages[0].role === "user"
                ? messages[0].parts.filter(p => p.type === 'text').map((p: any) => p.text).join('').substring(0, 50) + (messages[0].parts.filter(p => p.type === 'text').map((p: any) => p.text).join('').length > 50 ? "..." : "")
                : existingConv?.title || "New Chat"

            await saveConversation({
                id: currentConversationId,
                messages,
                createdAt: existingConv?.createdAt || Date.now(),
                title,
                mode,
                modelId: selectedModelId,
            })

            const allConvs = await getAllConversations()
            setAllConversations(allConvs)
        }

        saveMessages()
    }, [messages, currentConversationId, mode, selectedModelId])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useLayoutEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [input])

    const startListening = () => {
        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
            const recognition = new SpeechRecognition()

            recognition.continuous = false
            recognition.interimResults = true
            recognition.lang = "en-US"

            recognition.onstart = () => setIsListening(true)
            recognition.onend = () => setIsListening(false)

            recognition.onresult = (event: any) => {
                let interimTranscript = ""
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        setInput(event.results[i][0].transcript)
                    } else {
                        interimTranscript += event.results[i][0].transcript
                    }
                }
                if (interimTranscript) {
                    if (input !== interimTranscript) {
                        setInput(interimTranscript)
                    }
                }
            }

            recognition.start()
        } else {
            alert("Speech Recognition not supported in this browser.")
        }
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFilesToUpload(event.target.files)
        }
    }

    const customHandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!input?.trim() || isLoading) return

        const messageText = input
        setInput('')

        await sendMessage({ text: messageText })

        setFilesToUpload(undefined)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const clearConversation = useCallback(async () => {
        const newId = uuidv4()
        const newConv: Conversation = {
            id: newId,
            messages: [],
            createdAt: Date.now(),
            title: "New Chat",
        }
        await saveConversation(newConv)
        const allConvs = await getAllConversations()
        setAllConversations(allConvs)
        setCurrentConversationId(newId)
        setMessages([])
        window.history.pushState(null, "", `?conversationId=${newId}`)
    }, [setMessages])

    const loadConversation = useCallback(async (convId: string) => {
        const conv = await getConversation(convId)
        if (conv) {
            setCurrentConversationId(conv.id)
            setMessages(conv.messages)
            setMode((conv.mode as ConversationMode) || "general")
            setSelectedModelId(conv.modelId || models[0].id)
            window.history.pushState(null, "", `?conversationId=${conv.id}`)
            setShowSidebar(false)
        }
    }, [setMessages])

    const deleteConv = useCallback(async (convId: string) => {
        await deleteConversation(convId)
        const allConvs = await getAllConversations()
        setAllConversations(allConvs)
        if (convId === currentConversationId) {
            clearConversation()
        }
    }, [currentConversationId, clearConversation])

    const copyMessage = (content: string) => {
        navigator.clipboard.writeText(content)
    }

    const exportConversation = () => {
        const conversation = messages.map((m) => {
            const text = m.parts.filter(p => p.type === 'text').map((p: any) => p.text).join('')
            return `${m.role === "user" ? "You" : "AI"}: ${text}`
        }).join("\n\n")
        const blob = new Blob([conversation], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "ai-conversation.txt"
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleShareConversation = () => {
        if (currentConversationId) {
            const shareUrl = `${window.location.origin}${window.location.pathname}?conversationId=${currentConversationId}`
            navigator.clipboard
                .writeText(shareUrl)
                .then(() => alert("Conversation link copied to clipboard!"))
        }
    }

    const modeConfig = {
        general: { icon: MessageSquare, label: "General", color: "bg-blue-500" },
        shepherding: { icon: Brain, label: "Shepherding", color: "bg-purple-500" },
        letters: { icon: Code, label: "Letters", color: "bg-green-500" },
        ministry: { icon: Sparkles, label: "Ministry", color: "bg-orange-500" },
        meetings: { icon: Calculator, label: "Meetings", color: "bg-pink-500" },
        reports: { icon: Zap, label: "Reports", color: "bg-indigo-500" },
    }

    const quickActions = [
        {
            label: "Shepherding visit",
            prompt: "Help me prepare for a shepherding visit about ",
        },
        {
            label: "Write letter",
            prompt: "Help me write a letter of ",
        },
        {
            label: "Ministry presentation",
            prompt: "Suggest a field service presentation for ",
        },
        {
            label: "Meeting part",
            prompt: "Help me prepare a meeting part on ",
        },
    ]

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 gap-2 font-medium"
                >
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    AI
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[98%] sm:w-[95%] md:max-w-5xl h-[90vh] sm:h-[85vh] md:h-[80vh] flex flex-col p-0 overflow-hidden rounded-lg sm:rounded-xl shadow-2xl bg-gradient-to-br from-background to-muted/50">
                {/* Sidebar */}
                <div className={cn(
                    "absolute inset-y-0 left-0 z-50 w-full sm:w-72 md:w-80 bg-background border-r transform transition-transform duration-200 ease-in-out",
                    showSidebar ? "translate-x-0" : "-translate-x-full"
                )}>
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="font-semibold">Chat History</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <ScrollArea className="flex-1 p-2">
                            <div className="space-y-1">
                                {allConversations.map((conv) => (
                                    <div key={conv.id} className="group relative">
                                        <Button
                                            variant={conv.id === currentConversationId ? "secondary" : "ghost"}
                                            className="w-full justify-start text-left h-auto py-2 px-3"
                                            onClick={() => loadConversation(conv.id)}
                                        >
                                            <div className="flex-1 truncate">
                                                <div className="text-sm font-medium truncate">{conv.title}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(conv.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                deleteConv(conv.id)
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <DialogHeader className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-border/50 bg-gradient-to-r from-blue-500 to-purple-500 text-white flex-shrink-0 shadow-md">
                    <div className="flex items-center justify-between gap-2">
                        <DialogTitle className="flex items-center space-x-1 sm:space-x-2 text-base sm:text-lg md:text-xl font-semibold">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowSidebar(!showSidebar)}
                                className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9"
                            >
                                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                            <Bot className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                            <span className="hidden sm:inline">AI Assistant</span>
                            <span className="sm:hidden">AI</span>
                        </DialogTitle>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                            <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                                <SelectTrigger className="w-[100px] sm:w-[140px] md:w-[180px] bg-white/20 text-white hover:bg-white/30 transition-colors border-none text-xs sm:text-sm">
                                    <SelectValue placeholder="Model" />
                                </SelectTrigger>
                                <SelectContent className="bg-background">
                                    {models.map((model) => (
                                        <SelectItem key={model.id} value={model.id}>
                                            {model.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={clearConversation}
                                title="New Chat"
                                className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 hidden sm:flex"
                            >
                                <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleShareConversation}
                                title="Share"
                                className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 hidden md:flex"
                            >
                                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setVoiceEnabled(!voiceEnabled)}
                                className={cn("text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9", voiceEnabled && "bg-white/30")}
                                title={voiceEnabled ? "Disable Voice" : "Enable Voice"}
                            >
                                {voiceEnabled ? <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" /> : <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={exportConversation}
                                title="Export"
                                className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 hidden sm:flex"
                            >
                                <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 mt-3 sm:mt-4 bg-white/10 rounded-full p-1 overflow-x-auto scrollbar-hide">
                        {Object.entries(modeConfig).map(([key, config]) => {
                            const Icon = config.icon
                            return (
                                <Button
                                    key={key}
                                    variant={mode === key ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setMode(key as ConversationMode)}
                                    className={cn(
                                        "h-7 sm:h-8 rounded-full text-white transition-all duration-200 text-xs sm:text-sm whitespace-nowrap flex-shrink-0",
                                        mode === key ? "bg-white text-blue-600 shadow-md" : "hover:bg-white/20",
                                    )}
                                >
                                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                    <span className="hidden sm:inline">{config.label}</span>
                                </Button>
                            )
                        })}
                    </div>
                </DialogHeader>

                <div className="flex-1 flex flex-col min-h-0 relative border-t border-b border-border/50">
                    {" "}
                    {/* Added border-t and border-b */}
                    <ScrollArea className="flex-1 px-3 sm:px-4 md:px-6 py-3 sm:py-4 bg-background/80 backdrop-blur-sm overflow-auto">
                        {" "}
                        {/* Added background and backdrop-blur */}
                        <div className="space-y-6">
                            {messages.length === 0 && (
                                <div className="text-center py-12 space-y-6">
                                    <Bot className="h-16 w-16 text-muted-foreground mx-auto animate-bounce-slow" />
                                    <div>
                                        <h3 className="font-bold text-2xl text-foreground">Welcome to AI Assistant</h3>
                                        <p className="text-muted-foreground text-lg">How can I help you today?</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-lg mx-auto px-4">
                                        {quickActions.map((action, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setInput(action.prompt)}
                                                className="text-sm bg-background/70 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-lg shadow-sm"
                                            >
                                                <Zap className="h-3 w-3 mr-2 text-blue-500" />
                                                {action.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "flex items-start space-x-3",
                                        message.role === "user" ? "justify-end" : "justify-start",
                                    )}
                                >
                                    {message.role === "assistant" && (
                                        <Avatar className="flex-shrink-0 w-9 h-9 border-2 border-blue-500 shadow-md">
                                            <AvatarFallback className="bg-blue-600 text-white font-bold text-sm">AI</AvatarFallback>
                                        </Avatar>
                                    )}

                                    <div
                                    className={cn(
                                        "max-w-[85%] sm:max-w-[80%] md:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 relative group shadow-lg transition-all duration-300 ease-in-out",
                                            message.role === "user"
                                                ? "bg-blue-600 text-white rounded-br-none ml-auto"
                                                : "bg-muted rounded-bl-none mr-auto",
                                        )}
                                    >
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                code({ node, inline, className, children, ...props }) {
                                                    const match = /language-(\w+)/.exec(className || "")
                                                    return !inline && match ? (
                                                        <pre className="bg-gray-800 text-white p-3 rounded-md overflow-x-auto my-2">
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        </pre>
                                                    ) : (
                                                        <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded-sm text-sm font-mono">
                                                            {children}
                                                        </code>
                                                    )
                                                },
                                                p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                                                ul: ({ children }) => <ul className="list-disc list-inside my-2">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal list-inside my-2">{children}</ol>,
                                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                                a: ({ children, href }) => (
                                                    <a
                                                        href={href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-300 hover:underline"
                                                    >
                                                        {children}
                                                    </a>
                                                ),
                                            }}
                                        >
                                            {message.parts?.filter(p => p.type === 'text').map((p: any) => p.text).join('') || 'Loading...'}
                                        </ReactMarkdown>

                                        {/* Render attachments */}
                                        {(message as any)?.experimental_attachments
                                            ?.filter(
                                                (attachment: any) =>
                                                    attachment?.contentType?.startsWith("image/") ||
                                                    attachment?.contentType?.startsWith("application/pdf"),
                                            )
                                            .map((attachment: any, index: number) =>
                                                attachment.contentType?.startsWith("image/") ? (
                                                    <Image
                                                        key={`${message.id}-${index}`}
                                                        src={attachment.url || "/placeholder.svg"}
                                                        width={500}
                                                        height={500}
                                                        alt={attachment.name ?? `attachment-${index}`}
                                                        className="mt-2 rounded-md max-w-full h-auto"
                                                    />
                                                ) : attachment.contentType?.startsWith("application/pdf") ? (
                                                    <iframe
                                                        key={`${message.id}-${index}`}
                                                        src={attachment.url}
                                                        width="100%"
                                                        height="300"
                                                        title={attachment.name ?? `attachment-${index}`}
                                                        className="mt-2 rounded-md border border-gray-300"
                                                    />
                                                ) : null,
                                            )}

                                        <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground bg-background/50 backdrop-blur-sm rounded-full shadow-md"
                                                onClick={() => {
                                                    const text = message.parts.filter(p => p.type === 'text').map((p: any) => p.text).join('')
                                                    if (speakingMessageId === message.id) {
                                                        stopSpeaking()
                                                    } else {
                                                        playMessage(message.id, text)
                                                    }
                                                }}
                                                title={speakingMessageId === message.id ? "Stop speaking" : "Play message"}
                                            >
                                                {speakingMessageId === message.id ? (
                                                    <AudioWaveIndicator />
                                                ) : (
                                                    <Volume2 className="h-3.5 w-3.5" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground bg-background/50 backdrop-blur-sm rounded-full shadow-md"
                                                onClick={() => {
                                                    const text = message.parts.filter(p => p.type === 'text').map((p: any) => p.text).join('')
                                                    copyMessage(text)
                                                }}
                                                title="Copy message"
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {message.role === "user" && (
                                        <Avatar className="flex-shrink-0 w-9 h-9 border-2 border-gray-500 shadow-md">
                                            <AvatarFallback className="bg-gray-600 text-white font-bold text-sm">{username.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex items-start space-x-3">
                                    <Avatar className="flex-shrink-0 w-9 h-9 border-2 border-blue-500 shadow-md">
                                        <AvatarFallback className="bg-blue-600 text-white font-bold text-sm">AI</AvatarFallback>
                                    </Avatar>
                                    <div className="bg-muted rounded-2xl px-4 py-3 rounded-bl-none shadow-lg">
                                        <div className="flex space-x-1">
                                            <div className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-pulse" />
                                            <div
                                                className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-pulse"
                                                style={{ animationDelay: "0.1s" }}
                                            />
                                            <div
                                                className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-pulse"
                                                style={{ animationDelay: "0.2s" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="text-red-500 text-sm text-center py-2 bg-red-50 dark:bg-red-950 rounded-lg p-3 border border-red-200 dark:border-red-800 shadow-sm">
                                    <span className="font-semibold">Error:</span> {error.message}. Please try again.
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>
                    <div className="border-t border-border/50 p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 flex-shrink-0 bg-background/90 backdrop-blur-sm shadow-inner">
                        {isSpeaking && (
                            <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950 rounded-lg p-2 px-3 shadow-sm">
                                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-300">
                                    <AudioWaveIndicator />
                                    <span className="text-sm">AI is speaking...</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={stopSpeaking}
                                    className="text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800"
                                >
                                    Stop
                                </Button>
                            </div>
                        )}

                        <form onSubmit={customHandleSubmit} className="flex space-x-1 sm:space-x-2 items-end">
                            <div className="flex-1 relative bg-background rounded-lg sm:rounded-xl shadow-md border border-input">
                                <Textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask me anything..."
                                    className="min-h-[44px] sm:min-h-[48px] max-h-[120px] sm:max-h-[150px] pr-20 sm:pr-24 pl-3 sm:pl-4 py-2 sm:py-3 resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-base"
                                    disabled={isLoading}
                                    rows={1}
                                />
                                <div className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 flex space-x-0.5 sm:space-x-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Attach file"
                                    >
                                        <Paperclip className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-7 w-7 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                            isListening && "text-red-500 animate-pulse",
                                        )}
                                        onClick={startListening}
                                        disabled={isLoading}
                                        title={isListening ? "Stop Listening" : "Start Listening"}
                                    >
                                        {isListening ? <MicOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading || !input?.trim()}
                                className="h-11 w-11 sm:h-12 sm:w-12 p-0 rounded-lg sm:rounded-xl shadow-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                            >
                                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                        </form>

                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            onChange={handleFileSelect} // Changed to handleFileSelect
                            accept="image/*,.pdf,.txt,.doc,.docx"
                            multiple // Allow multiple files if needed in the future
                        />
                        {filesToUpload && filesToUpload.length > 0 && (
                            <div className="mt-2 text-sm text-muted-foreground">
                                Selected files:{" "}
                                {Array.from(filesToUpload)
                                    .map((file) => file.name)
                                    .join(", ")}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
