'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import StatCard from '@/components/StatCard'
import { fetchDashboardStats, fetchVendors, getRiskClass, formatCurrency } from '@/lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import ScoreRing from '@/components/ScoreRing'
import Link from 'next/link'

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchDashboardStats(), fetchVendors()])
      .then(([s, v]) => { setStats(s); setVendors(v) })
      .finally(() => setLoading(false))
  }, [])

  const SCORE_COLORS = ['#f85149','#d29922','#58a6ff','#3fb950','#25a370']

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, color: 'var(--color-brand)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            ✦ AI-Powered Intelligence Dashboard
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', color: '#e6edf3' }}>
            Vendor Overview
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 14, marginTop: 4 }}>
            Real-time AI scoring, predictive risk detection, and smart recommendations.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-muted)' }}><div className="loader" /> Loading intelligence...</div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
              <StatCard label="Total Vendors" value={stats?.total_vendors} sub="Under management" icon="◈" accent="var(--color-brand)" />
              <StatCard label="Avg AI Score" value={`${stats?.avg_score}/100`} sub="Across all vendors" icon="⬡" accent="#58a6ff" />
              <StatCard label="High Risk" value={stats?.high_risk_count} sub="Need immediate action" icon="◉" accent="#f85149" />
              <StatCard label="Total Spend" value={formatCurrency(stats?.total_spend)} sub="Active contracts" icon="◎" accent="#d29922" />
            </div>

            {/* Alerts */}
            {stats?.alerts?.length > 0 && (
              <div className="card" style={{ padding: '16px 20px', marginBottom: 24, borderColor: 'rgba(248,81,73,0.3)', background: 'rgba(248,81,73,0.06)' }}>
                <div style={{ fontSize: 12, color: '#f85149', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>⚠ Active Alerts</div>
                {stats.alerts.map((a: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderTop: i > 0 ? '1px solid rgba(248,81,73,0.15)' : 'none' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f85149', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: '#e6edf3', fontSize: 13 }}>{a.vendor}:</span>
                    <span style={{ color: 'var(--color-muted)', fontSize: 13 }}>{a.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Charts + Vendor list */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20, marginBottom: 24 }}>
              {/* Bar chart */}
              <div className="card" style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>AI Score Comparison</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={vendors} barSize={32}>
                    <XAxis dataKey="name" tick={{ fill: 'var(--color-muted)', fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={(v: string) => v.split(' ')[0]} />
                    <YAxis domain={[0, 100]} tick={{ fill: 'var(--color-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, color: '#e6edf3', fontSize: 12 }} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {vendors.map((v, i) => <Cell key={i} fill={SCORE_COLORS[i % SCORE_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Vendor quick list */}
              <div className="card" style={{ padding: '20px 24px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 16 }}>Vendor Leaderboard</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[...vendors].sort((a, b) => b.score - a.score).map((v, i) => (
                    <Link key={v.id} href={`/vendors/${v.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'}
                      >
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>#{i + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#e6edf3' }}>{v.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{v.category}</div>
                        </div>
                        <ScoreRing score={v.score} size={44} strokeWidth={5} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Top vendor highlight */}
            <div className="card glow-brand" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, borderColor: 'rgba(37,163,112,0.3)', background: 'rgba(37,163,112,0.05)' }}>
              <div style={{ fontSize: 28 }}>✦</div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-brand)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Recommendation</div>
                <div style={{ color: '#e6edf3', fontSize: 14, marginTop: 2 }}>
                  Top-performing vendor: <strong style={{ color: 'var(--color-brand)' }}>{stats?.top_vendor}</strong>. Consider expanding contract scope or increasing volume with this vendor.
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
