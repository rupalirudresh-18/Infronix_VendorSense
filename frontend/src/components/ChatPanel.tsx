'use client'
import { useState, useRef, useEffect } from 'react'
import { sendChatMessage } from '@/lib/api'

interface ChatMessage {
  role: 'user' | 'ai'
  text: string
  ts: string
}

interface ChatPanelProps {
  vendorId?: string
  vendorName?: string
}

function renderMd(text: string) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

export default function ChatPanel({ vendorId, vendorName }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: vendorName
        ? `Hello! I'm analyzing **${vendorName}** for you. Ask me about their risk scores, delay predictions, external signals, or what actions you should take.`
        : `Hello! I'm the VendorSense AI assistant. Ask me about any vendor's risk, performance scores, delay predictions, or supply chain recommendations.`,
      ts: new Date().toLocaleTimeString(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const QUICK = vendorId
    ? ['What is the delay risk?', 'Explain this vendor\'s score', 'What actions should I take?', 'Show external signals']
    : ['Which vendor is highest risk?', 'Who is the top performer?', 'Total vendor spend?', 'Any critical alerts?']

  async function send(text?: string) {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text: msg, ts: new Date().toLocaleTimeString() }])
    setLoading(true)
    try {
      const data = await sendChatMessage(msg, vendorId)
      setMessages(m => [...m, { role: 'ai', text: data.reply, ts: new Date().toLocaleTimeString() }])
    } catch {
      setMessages(m => [...m, { role: 'ai', text: 'API connection error. Make sure the backend is running on port 8000.', ts: new Date().toLocaleTimeString() }])
    }
    setLoading(false)
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 480 }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#25a370,#1a6e4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✦</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#e6edf3' }}>VendorSense AI</div>
          <div style={{ fontSize: 11, color: 'var(--color-brand)' }}>● Live · Explainable Intelligence</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%', padding: '10px 14px', borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              background: m.role === 'user' ? 'var(--color-brand)' : 'rgba(255,255,255,0.05)',
              border: m.role === 'ai' ? '1px solid var(--color-border)' : 'none',
              fontSize: 13.5, lineHeight: 1.6, color: '#e6edf3',
            }}>
              <div className="chat-msg" dangerouslySetInnerHTML={{ __html: renderMd(m.text) }} />
              <div style={{ fontSize: 10, color: m.role === 'user' ? 'rgba(255,255,255,0.6)' : 'var(--color-muted)', marginTop: 4, textAlign: 'right' }}>{m.ts}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--color-muted)', fontSize: 13 }}>
            <div className="loader" /> Analyzing...
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick questions */}
      <div style={{ padding: '8px 20px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)} style={{
            fontSize: 11, padding: '4px 10px', borderRadius: 20,
            border: '1px solid var(--color-border)', background: 'transparent',
            color: 'var(--color-muted)', cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-brand)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-brand)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)' }}
          >{q}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: 10 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about risk, predictions, recommendations..."
          style={{
            flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)',
            borderRadius: 8, padding: '10px 14px', color: '#e6edf3', fontSize: 13, outline: 'none',
          }} />
        <button onClick={() => send()} disabled={loading} style={{
          background: 'var(--color-brand)', border: 'none', borderRadius: 8,
          padding: '10px 16px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13,
          opacity: loading ? 0.6 : 1,
        }}>Send</button>
      </div>
    </div>
  )
}
