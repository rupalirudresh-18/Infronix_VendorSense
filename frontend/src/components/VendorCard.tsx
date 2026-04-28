import Link from 'next/link'
import ScoreRing from './ScoreRing'
import { getRiskClass, getTrendIcon, formatCurrency } from '@/lib/api'

interface VendorCardProps {
  vendor: any
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const trendIcon = getTrendIcon(vendor.trend)
  const trendColor = vendor.trend === 'improving' ? '#3fb950' : vendor.trend === 'declining' ? '#f85149' : '#8b949e'

  return (
    <Link href={`/vendors/${vendor.id}`} style={{ textDecoration: 'none' }}>
      <div className="card animate-fade-in" style={{
        padding: 20, cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = 'rgba(37,163,112,0.4)'
          el.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = 'var(--color-border)'
          el.style.transform = 'translateY(0)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#e6edf3', marginBottom: 4 }}>{vendor.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>{vendor.category}</div>
            <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 2 }}>🌍 {vendor.country}</div>
          </div>
          <ScoreRing score={vendor.score} size={62} strokeWidth={6} />
        </div>

        {/* Risk badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className={`${getRiskClass(vendor.risk_level)}`} style={{
            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
            border: '1px solid currentColor', letterSpacing: '0.06em', textTransform: 'uppercase'
          }}>
            {vendor.risk_level} Risk
          </span>
          <span style={{ fontSize: 13, color: trendColor, fontFamily: 'var(--font-mono)' }}>
            {trendIcon} {vendor.trend}
          </span>
        </div>

        {/* Metrics row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ fontSize: 10, color: 'var(--color-muted)', marginBottom: 2 }}>Delay Risk</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: vendor.delay_probability > 0.5 ? '#f85149' : '#3fb950', fontWeight: 700 }}>
              {(vendor.delay_probability * 100).toFixed(0)}%
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ fontSize: 10, color: 'var(--color-muted)', marginBottom: 2 }}>Contract</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#e6edf3', fontWeight: 700 }}>
              {formatCurrency(vendor.contract_value)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
