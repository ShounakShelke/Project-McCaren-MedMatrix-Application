import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Volume2, Globe, Sparkles } from 'lucide-react'
import { apiClient } from '../services/apiClient'

export const ChatBotPanel: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; sources?: string[] }>>([
    { sender: 'bot', text: 'Namaste! I am your Project McCaren AI Assistant. Ask me anything about PM-JAY or ESIC coverage limits and claim processes.' }
  ])
  const [input, setInput] = useState('')
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const quickPrompts = [
    { text: 'PM-JAY coverage limits', label: 'PM-JAY Limit' },
    { text: 'Who is eligible for ESIC?', label: 'ESIC Eligibility' },
    { text: 'Is fracture covered under PM-JAY?', label: 'Fracture Cover' }
  ]

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: textToSend }])
    setInput('')
    setLoading(true)

    try {
      const response = await apiClient.post('/api/v1/chat/', {
        message: textToSend,
        language
      })
      
      const { response: botResponse, sources } = response.data
      setMessages(prev => [...prev, { sender: 'bot', text: botResponse, sources }])
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am facing trouble connecting to the healthcare database. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  // Voice Assistant Synthesis (Web Speech API)
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel existing speech
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="flex flex-col h-[600px] glass rounded-3xl border border-slate-200/50 dark:border-slate-800/30 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm">AI Copilot Assistant</h3>
            <span className="text-[10px] opacity-75">Scheme RAG Chatbot</span>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Lang Selector */}
          <button 
            onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg transition-all"
          >
            <Globe size={12} />
            <span>{language === 'en' ? 'English' : 'हिंदी'}</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/10">
        {messages.map((msg, idx) => {
          const isBot = msg.sender === 'bot'
          return (
            <div key={idx} className={`flex gap-3 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
              <div className={`size-8 rounded-full flex items-center justify-center shadow-sm shrink-0 ${
                isBot ? 'bg-primary-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}>
                {isBot ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="flex flex-col gap-1">
                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                  isBot 
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/40 dark:border-slate-800/50 rounded-tl-sm' 
                    : 'bg-primary-500 text-white rounded-tr-sm'
                }`}>
                  <p>{msg.text}</p>
                  
                  {isBot && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap gap-1 items-center">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Citations:</span>
                      {msg.sources.map((s, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {isBot && (
                  <button 
                    onClick={() => speakMessage(msg.text)}
                    className="self-start text-slate-400 hover:text-primary-500 transition-all p-1"
                    title="Listen to response"
                  >
                    <Volume2 size={14} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-center">
            <div className="size-8 rounded-full bg-primary-500 text-white flex items-center justify-center animate-pulse">
              <Bot size={16} />
            </div>
            <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl rounded-tl-sm shadow-sm border border-slate-200/40 dark:border-slate-800/50 flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="size-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="size-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick suggestions */}
      <div className="px-4 py-2 border-t border-slate-200/50 dark:border-slate-800/20 bg-slate-100/50 dark:bg-slate-800/20 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p.text)}
            className="flex items-center gap-1 text-[11px] font-bold text-primary-600 dark:text-primary-400 bg-primary-500/10 dark:bg-primary-500/5 border border-primary-500/15 hover:bg-primary-500/20 px-2.5 py-1 rounded-full shrink-0 transition-all"
          >
            <Sparkles size={10} />
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(input) }} 
        className="p-3 border-t border-slate-200/50 dark:border-slate-800/30 bg-white dark:bg-slate-800 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={language === 'en' ? "Ask details about policies..." : "पॉलिसी के बारे में पूछें..."}
          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500 dark:text-white"
        />
        <button 
          type="submit" 
          disabled={!input.trim()}
          className="size-9 bg-primary-500 hover:bg-primary-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-all shrink-0 shadow-md shadow-primary-500/20"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
