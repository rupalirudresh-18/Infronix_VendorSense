'use client'
import Sidebar from '@/components/Sidebar'
import ChatPanel from '@/components/ChatPanel'
import { useEffect, useState } from 'react'
import { fetchVendors } from '@/lib/api'

export default function AssistantPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [selectedVendor, setSelectedVendor] = useState<string | undefined>()

  useEffect(() => { fetchVendors().then(setVendors) }, [])

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-brand)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>✦ AI Assistant</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', color: '#e6edf3' }}>Explainable AI Chat</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 14, marginTop: 4 }}>Ask the AI about any vendor's risk, scores, predictions, or recommendations. It explains every decision.</p>
        </div>

        {/* Vendor context selector */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Focus on:</span>
          <button onClick={() => setSelectedVendor(undefined)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
            background: !selectedVendor ? 'var(--color-brand)' : 'transparent',
            border: `1px solid ${!selectedVendor ? 'var(--color-brand)' : 'var(--color-border)'}`,
            color: !selectedVendor ? '#fff' : 'var(--color-muted)', transition: 'all 0.15s',
          }}>All Vendors</button>
          {vendors.map(v => (
            <button key={v.id} onClick={() => setSelectedVendor(v.id)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
              background: selectedVendor === v.id ? 'var(--color-brand)' : 'transparent',
              border: `1px solid ${selectedVendor === v.id ? 'var(--color-brand)' : 'var(--color-border)'}`,
              color: selectedVendor === v.id ? '#fff' : 'var(--color-muted)', transition: 'all 0.15s',
            }}>{v.name}</button>
          ))}
        </div>

        <div style={{ flex: 1, minHeight: 500 }}>
          <ChatPanel
            key={selectedVendor || 'all'}
            vendorId={selectedVendor}
            vendorName={vendors.find(v => v.id === selectedVendor)?.name}
          />
        </div>

        {/* Capability cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { icon: '📊', title: 'Score Analysis', desc: 'Understand exactly how AI scored a vendor' },
            { icon: '⚠', title: 'Risk Alerts', desc: 'Get instant risk summaries and critical flags' },
            { icon: '🔮', title: 'Predictions', desc: 'Ask for delay probability and future risk' },
            { icon: '💡', title: 'Recommendations', desc: 'AI tells you what action to take and why' },
          ].map(c => (
            <div key={c.title} className="card" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3', marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
