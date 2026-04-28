'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import ScoreRing from '@/components/ScoreRing'
import ChatPanel from '@/components/ChatPanel'
import { fetchVendor, fetchVendorPrediction, getRiskClass, getRiskColor, formatCurrency } from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area } from 'recharts'

const REC_ICONS: Record<string, string> = {
  warning: '⚠', critical: '🔴', negotiate: '💬', monitor: '👁', positive: '✅'
}

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [vendor, setVendor] = useState<any>(null)
  const [prediction, setPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'predict' | 'explain'>('overview')

  useEffect(() => {
    Promise.all([fetchVendor(id), fetchVendorPrediction(id)])
      .then(([v, p]) => { setVendor(v); setPrediction(p) })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-muted)' }}><div className="loader" /> Loading vendor intelligence...</div>
      </main>
    </div>
  )

  const riskColor = getRiskColor(vendor.risk_level)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 6 }}>
              <a href="/vendors" style={{ color: 'var(--color-brand)', textDecoration: 'none' }}>Vendors</a> / {vendor.name}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#e6edf3' }}>{vendor.name}</h1>
            <div style={{ color: 'var(--color-muted)', fontSize: 14, marginTop: 4 }}>
              {vendor.category} · {vendor.country} · Partner since {vendor.since}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <ScoreRing score={vendor.overall_score} size={90} strokeWidth={8} />
              <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 4 }}>AI Score</div>
            </div>
            <div className="card" style={{ padding: '12px 16px', textAlign: 'center', borderColor: 'rgba(248,81,73,0.3)' }}>
              <div style={{ fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 800, color: vendor.delay_probability > 0.5 ? '#f85149' : '#3fb950' }}>
                {(vendor.delay_probability * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>Delay Risk</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--color-border)' }}>
          {(['overview', 'predict', 'explain'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: 'transparent', border: 'none',
              borderBottom: tab === t ? '2px solid var(--color-brand)' : '2px solid transparent',
              color: tab === t ? 'var(--color-brand)' : 'var(--color-muted)',
              textTransform: 'capitalize', transition: 'all 0.15s', marginBottom: -1,
            }}>{t === 'predict' ? '🔮 Predict' : t === 'explain' ? '🧠 Explainability' : '📊 Overview'}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Performance metrics */}
              <div className="card" style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>Performance Metrics</div>
                {[
                  { label: 'Cost Efficiency', val: vendor.cost_efficiency, color: '#25a370' },
                  { label: 'Delivery Reliability', val: vendor.delivery_reliability, color: '#58a6ff' },
                  { label: 'Quality Score', val: vendor.quality_score, color: '#d29922' },
                  { label: 'Past Performance', val: vendor.past_performance, color: '#bc8cff' },
                ].map(m => (
                  <div key={m.label} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{m.label}</span>
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: m.color, fontWeight: 600 }}>{m.val}%</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${m.val}%`, background: m.color, borderRadius: 3, transition: 'width 1s ease', boxShadow: `0 0 8px ${m.color}` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Historical trend */}
              <div className="card" style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>12-Month Score Trend</div>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={vendor.timeseries}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-brand)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-brand)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fill: 'var(--color-muted)', fontSize: 9 }} axisLine={false} tickLine={false} interval={2} />
                    <YAxis domain={[20, 100]} tick={{ fill: 'var(--color-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, color: '#e6edf3', fontSize: 11 }} />
                    <ReferenceLine y={65} stroke="#d29922" strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="score" stroke="var(--color-brand)" strokeWidth={2} fill="url(#scoreGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Recommendations */}
              <div className="card" style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 14 }}>AI Recommendations</div>
                {vendor.recommendations.map((r: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < vendor.recommendations.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <div style={{ fontSize: 18, flexShrink: 0 }}>{REC_ICONS[r.type] || '💡'}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#e6edf3', marginBottom: 2 }}>{r.action}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.5 }}>{r.detail}</div>
                      <div style={{ marginTop: 4, fontSize: 11, fontFamily: 'var(--font-mono)', color: r.impact === 'Critical' ? '#f85149' : r.impact === 'High' ? '#d29922' : r.impact === 'Opportunity' ? '#3fb950' : 'var(--color-muted)' }}>
                        Impact: {r.impact}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: external signals + chat */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* External signals */}
              <div className="card" style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 14 }}>🌍 External Signals</div>
                {[
                  { label: 'News Sentiment', val: vendor.news_sentiment, fmt: (v: number) => v.toFixed(2), color: vendor.news_sentiment > 0 ? '#3fb950' : '#f85149', suffix: '' },
                  { label: 'Weather Risk Index', val: vendor.weather_risk, fmt: (v: number) => `${(v * 100).toFixed(0)}%`, color: vendor.weather_risk > 0.4 ? '#d29922' : '#3fb950', suffix: '' },
                  { label: 'Market Volatility', val: vendor.market_volatility, fmt: (v: number) => v.toFixed(2), color: vendor.market_volatility > 0.5 ? '#f85149' : '#58a6ff', suffix: '' },
                  { label: 'Region Risk', val: vendor.region_risk, fmt: (v: any) => v, color: vendor.region_risk === 'High' ? '#f85149' : vendor.region_risk === 'Low' ? '#3fb950' : '#d29922', suffix: '' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{s.label}</span>
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700, color: s.color }}>{s.fmt(s.val as any)}</span>
                  </div>
                ))}
                {vendor.recent_incidents?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 6 }}>Recent Incidents</div>
                    {vendor.recent_incidents.map((inc: string, i: number) => (
                      <div key={i} style={{ fontSize: 12, color: '#d29922', padding: '4px 0' }}>⚠ {inc}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick stats */}
              <div className="card" style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 14 }}>Contract Details</div>
                {[
                  { label: 'Contract Value', val: formatCurrency(vendor.contract_value) },
                  { label: 'Response Time', val: `${vendor.response_time}h avg` },
                  { label: 'On-Time Rate', val: `${vendor.on_time_rate}%` },
                  { label: 'Defect Rate', val: `${vendor.defect_rate}%` },
                  { label: 'Failure Risk', val: `${(vendor.failure_risk * 100).toFixed(0)}%` },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{s.label}</span>
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: '#e6edf3', fontWeight: 600 }}>{s.val}</span>
                  </div>
                ))}
              </div>

              {/* Chat */}
              <div style={{ flex: 1 }}>
                <ChatPanel vendorId={vendor.id} vendorName={vendor.name} />
              </div>
            </div>
          </div>
        )}

        {tab === 'predict' && prediction && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card" style={{ padding: '24px', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 4 }}>🔮 6-Month Delay Probability Forecast</div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>AI confidence: {(prediction.model_confidence * 100).toFixed(0)}% · Time-series forecasting model</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 800, color: vendor.delay_probability > 0.5 ? '#f85149' : '#3fb950' }}>
                    {(vendor.delay_probability * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>Current month risk</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={prediction.forecast}>
                  <defs>
                    <linearGradient id="delayGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f85149" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f85149" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 1]} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} tick={{ fill: 'var(--color-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: any) => [`${(v * 100).toFixed(1)}%`, 'Delay Probability']} contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, color: '#e6edf3', fontSize: 12 }} />
                  <ReferenceLine y={0.5} stroke="#d29922" strokeDasharray="4 4" label={{ value: 'High Risk Threshold', fill: '#d29922', fontSize: 10 }} />
                  <Area type="monotone" dataKey="delay_probability" stroke="#f85149" strokeWidth={2} fill="url(#delayGrad)" dot={{ fill: '#f85149', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 14 }}>Key Risk Drivers</div>
              {prediction.key_drivers.map((d: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, background: 'rgba(248,81,73,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#f85149', flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>{d}</span>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 14 }}>Failure Risk Assessment</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
                <ScoreRing score={Math.round((1 - prediction.failure_risk_score) * 100)} size={80} strokeWidth={7} />
                <div>
                  <div style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 800, color: prediction.failure_risk_score > 0.3 ? '#f85149' : '#3fb950' }}>
                    {(prediction.failure_risk_score * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Vendor Failure Risk</div>
                  <div style={{ fontSize: 11, color: 'var(--color-brand)', marginTop: 4 }}>Model confidence: {(prediction.model_confidence * 100).toFixed(0)}%</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)', lineHeight: 1.7 }}>
                Classification model trained on delivery patterns, financial signals, and external risk indicators. Predicts vendor operational continuity risk over 90-day horizon.
              </div>
            </div>
          </div>
        )}

        {tab === 'explain' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 6 }}>🧠 AI Score Explainability</div>
              <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 20 }}>
                How the AI computed <strong style={{ color: 'var(--color-brand)' }}>{vendor.overall_score}/100</strong> for {vendor.name}
              </div>

              {Object.entries(vendor.explainability).map(([key, info]: [string, any]) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#e6edf3', textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--color-muted)', marginLeft: 8 }}>Weight: {info.weight}</span>
                    </div>
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: info.impact === 'Positive' ? '#3fb950' : info.impact === 'Neutral' ? '#8b949e' : '#f85149', fontWeight: 700 }}>
                      {typeof info.value === 'number' && info.value > 1 ? `${info.value}%` : typeof info.value === 'number' ? info.value.toFixed(2) : info.value}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                      <div style={{
                        height: '100%', borderRadius: 3, transition: 'width 1s ease',
                        width: `${typeof info.value === 'number' && info.value <= 1 ? info.value * 100 : info.value}%`,
                        background: info.impact === 'Positive' ? '#3fb950' : info.impact === 'Neutral' ? '#8b949e' : '#f85149',
                      }} />
                    </div>
                    <span style={{ fontSize: 10, color: info.impact === 'Positive' ? '#3fb950' : info.impact === 'Neutral' ? '#8b949e' : '#f85149', fontWeight: 600, minWidth: 48, textAlign: 'right' }}>
                      {info.impact}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: '20px 24px', borderColor: 'rgba(37,163,112,0.3)', background: 'rgba(37,163,112,0.05)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-brand)', marginBottom: 10 }}>✦ AI Verdict</div>
                <div style={{ fontSize: 13, color: '#e6edf3', lineHeight: 1.7 }}>
                  <strong>{vendor.name}</strong> scored <strong style={{ color: 'var(--color-brand)' }}>{vendor.overall_score}/100</strong> ({vendor.risk_level} Risk).{' '}
                  {vendor.delivery_reliability < 65
                    ? `Delivery reliability dropped to ${vendor.delivery_reliability}% — the primary score drag. `
                    : `Strong delivery reliability at ${vendor.delivery_reliability}%. `}
                  {vendor.news_sentiment < 0
                    ? `Negative news sentiment (${vendor.news_sentiment.toFixed(2)}) adds external risk. `
                    : `Positive market sentiment supports vendor stability. `}
                  {vendor.recent_incidents?.length > 0
                    ? `Recent incidents: ${vendor.recent_incidents.join(', ')}.`
                    : 'No recent incidents recorded.'}
                </div>
              </div>

              <ChatPanel vendorId={vendor.id} vendorName={vendor.name} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
