'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { fetchVendors, getRiskColor, getRiskClass } from '@/lib/api'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip, ScatterChart, Scatter, XAxis, YAxis, ZAxis } from 'recharts'
import Link from 'next/link'

export default function RiskPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendors().then(setVendors).finally(() => setLoading(false))
  }, [])

  const sorted = [...vendors].sort((a, b) => b.delay_probability - a.delay_probability)

  const scatterData = vendors.map(v => ({
    x: v.score,
    y: Math.round(v.delay_probability * 100),
    z: v.contract_value / 100000,
    name: v.name,
  }))

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: 'var(--color-brand)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>◉ Risk Intelligence</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', color: '#e6edf3' }}>Risk Matrix</h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 14, marginTop: 4 }}>AI-detected risk signals, delay probabilities, and failure predictions.</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-muted)' }}><div className="loader" /> Analyzing risk signals...</div>
        ) : (
          <>
            {/* Risk ranking table */}
            <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>Vendor Risk Ranking</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Vendor', 'Risk Level', 'Delay Probability', 'Failure Risk', 'Trend', 'Score', 'Action'].map(h => (
                      <th key={h} style={{ textAlign: 'left', fontSize: 11, color: 'var(--color-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0 12px 12px 0', borderBottom: '1px solid var(--color-border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(v => (
                    <tr key={v.id}>
                      <td style={{ padding: '12px 12px 12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ fontWeight: 500, color: '#e6edf3', fontSize: 13 }}>{v.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{v.category}</div>
                      </td>
                      <td style={{ padding: '12px 12px 12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span className={getRiskClass(v.risk_level)} style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 12, border: '1px solid currentColor', letterSpacing: '0.04em' }}>
                          {v.risk_level}
                        </span>
                      </td>
                      <td style={{ padding: '12px 12px 12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 60, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                            <div style={{ height: '100%', width: `${v.delay_probability * 100}%`, background: v.delay_probability > 0.5 ? '#f85149' : '#3fb950', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: v.delay_probability > 0.5 ? '#f85149' : '#3fb950', fontWeight: 700 }}>
                            {(v.delay_probability * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 12px 12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-muted)' }}>
                        {(v.failure_risk * 100).toFixed(0)}%
                      </td>
                      <td style={{ padding: '12px 12px 12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12, color: v.trend === 'improving' ? '#3fb950' : v.trend === 'declining' ? '#f85149' : '#8b949e' }}>
                        {v.trend === 'improving' ? '↑' : v.trend === 'declining' ? '↓' : '→'} {v.trend}
                      </td>
                      <td style={{ padding: '12px 12px 12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: getRiskColor(v.risk_level) }}>
                        {v.score}
                      </td>
                      <td style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <Link href={`/vendors/${v.id}`} style={{ fontSize: 12, color: 'var(--color-brand)', textDecoration: 'none', fontWeight: 600 }}>
                          Analyze →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Scatter plot */}
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 4 }}>Risk vs Score Bubble Chart</div>
              <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 16 }}>Bubble size = contract value. Bottom-right = ideal position (high score, low risk).</div>
              <ResponsiveContainer width="100%" height={260}>
                <ScatterChart>
                  <XAxis dataKey="x" name="AI Score" domain={[50, 100]} label={{ value: 'AI Score', fill: 'var(--color-muted)', fontSize: 11 }} tick={{ fill: 'var(--color-muted)', fontSize: 11 }} />
                  <YAxis dataKey="y" name="Delay Risk %" domain={[0, 100]} label={{ value: 'Delay Risk %', angle: -90, fill: 'var(--color-muted)', fontSize: 11 }} tick={{ fill: 'var(--color-muted)', fontSize: 11 }} />
                  <ZAxis dataKey="z" range={[80, 400]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, color: '#e6edf3', fontSize: 12 }}
                    content={({ payload }) => {
                      if (!payload?.length) return null
                      const d = payload[0]?.payload
                      return <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                        <div style={{ fontWeight: 600, color: '#e6edf3' }}>{d?.name}</div>
                        <div style={{ color: 'var(--color-muted)' }}>Score: {d?.x} · Delay: {d?.y}%</div>
                      </div>
                    }}
                  />
                  <Scatter data={scatterData} fill="var(--color-brand)" fillOpacity={0.8} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
