import { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: string
  icon?: string
}

export default function StatCard({ label, value, sub, accent, icon }: StatCardProps) {
  return (
    <div className="card animate-slide-up" style={{ padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accent || 'var(--color-brand)', opacity: 0.7 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#e6edf3', letterSpacing: '-0.03em' }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>{sub}</div>}
        </div>
        {icon && <div style={{ fontSize: 28, opacity: 0.6 }}>{icon}</div>}
      </div>
    </div>
  )
}
