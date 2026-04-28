'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import VendorCard from '@/components/VendorCard'
import { fetchVendors } from '@/lib/api'

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchVendors().then(setVendors).finally(() => setLoading(false))
  }, [])

  const filtered = vendors.filter(v => {
    const matchRisk = filter === 'all' || v.risk_level.toLowerCase() === filter
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase())
    return matchRisk && matchSearch
  })

  const filters = ['all', 'low', 'medium', 'high', 'critical']

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: 'var(--color-brand)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>◈ Vendor Database</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', color: '#e6edf3' }}>All Vendors</h1>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search vendors..."
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 14px', color: '#e6edf3', fontSize: 13, outline: 'none', width: 220 }} />
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: filter === f ? 'var(--color-brand)' : 'transparent',
              border: `1px solid ${filter === f ? 'var(--color-brand)' : 'var(--color-border)'}`,
              color: filter === f ? '#fff' : 'var(--color-muted)',
              textTransform: 'capitalize', transition: 'all 0.15s',
            }}>
              {f === 'all' ? 'All' : `${f} Risk`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-muted)' }}><div className="loader" /> Loading vendors...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {filtered.map(v => <VendorCard key={v.id} vendor={v} />)}
            {filtered.length === 0 && <div style={{ color: 'var(--color-muted)', fontSize: 14 }}>No vendors match your filters.</div>}
          </div>
        )}
      </main>
    </div>
  )
}
