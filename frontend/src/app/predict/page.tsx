'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { fetchVendors, fetchVendorPrediction } from '@/lib/api'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function PredictPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [selected, setSelected] = useState<string>('')
  const [prediction, setPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [predLoading, setPredLoading] = useState(false)

  useEffect(() => {
    fetchVendors().then(v => {
      setVendors(v)
      setSelected(v[0]?.id || '')
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selected) return
    setPredLoading(true)
    fetchVendorPrediction(selected).then(setPrediction).finally(() => setPredLoading(false))
  }, [selected])

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: 'var(--color-brand)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>◎ Predictive Intelligence</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', color: '#e6edf3' }}>6-Month Predictions</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 14, marginTop: 4 }}>AI forecasts vendor delay probability and failure risk using time-series and classification models.</p>
        </div>

        {/* Vendor selector */}
        <div style={{ marginBottom: 24, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {vendors.map(v => (
            <button key={v.id} onClick={() => setSelected(v.id)} style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
              background: selected === v.id ? 'var(--color-brand)' : 'var(--color-card)',
              border: `1px solid ${selected === v.id ? 'var(--color-brand)' : 'var(--color-border)'}`,
              color: selected === v.id ? '#fff' : '#e6edf3', fontWeight: selected === v.id ? 600 : 400,
            }}>{v.name}</button>
          ))}
        </div>

        {(loading || predLoading) ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-muted)' }}><div className="loader" /> Running prediction model...</div>
        ) : prediction && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Hero prediction */}
            <div className="card" style={{ padding: '28px 32px', borderColor: prediction.current_delay_probability > 0.5 ? 'rgba(248,81,73,0.3)' : 'rgba(63,185,80,0.3)', background: prediction.current_delay_probability > 0.5 ? 'rgba(248,81,73,0.05)' : 'rgba(63,185,80,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 6 }}>AI PREDICTION · {prediction.vendor_name}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#e6edf3', letterSpacing: '-0.02em' }}>
                    This vendor has a{' '}
                    <span style={{ color: prediction.current_delay_probability > 0.5 ? '#f85149' : '#3fb950' }}>
                      {(prediction.current_delay_probability * 100).toFixed(0)}% chance of delay
                    </span>{' '}
                    next month.
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 6 }}>
                    Model confidence: {(prediction.model_confidence * 100).toFixed(0)}% · Failure risk: {(prediction.failure_risk_score * 100).toFixed(0)}%
                  </div>
                </div>
                <div style={{ fontSize: 60, opacity: 0.6 }}>🔮</div>
              </div>
            </div>

            {/* Forecast chart */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 4 }}>Delay Probability Forecast</div>
              <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 16 }}>Dashed line = 50% high-risk threshold</div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={prediction.forecast}>
                  <defs>
                    <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f85149" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f85149" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: 'var(--color-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 1]} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} tick={{ fill: 'var(--color-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: any) => [`${(v * 100).toFixed(1)}%`, 'Delay Probability']} contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, color: '#e6edf3', fontSize: 12 }} />
                  <ReferenceLine y={0.5} stroke="#d29922" strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="delay_probability" stroke="#f85149" strokeWidth={2.5} fill="url(#fg)" dot={{ fill: '#f85149', r: 5, strokeWidth: 2, stroke: '#1a1a2e' }} activeDot={{ r: 7 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Key drivers */}
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 14 }}>Model Key Drivers</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {prediction.key_drivers.map((d: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(248,81,73,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#f85149', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
