const BASE = '/api'

export async function fetchVendors() {
  const res = await fetch(`${BASE}/vendors`)
  if (!res.ok) throw new Error('Failed to fetch vendors')
  return res.json()
}

export async function fetchVendor(id: string) {
  const res = await fetch(`${BASE}/vendors/${id}`)
  if (!res.ok) throw new Error('Failed to fetch vendor')
  return res.json()
}

export async function fetchDashboardStats() {
  const res = await fetch(`${BASE}/dashboard/stats`)
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}

export async function fetchVendorPrediction(id: string) {
  const res = await fetch(`${BASE}/vendors/${id}/predict`)
  if (!res.ok) throw new Error('Failed to fetch prediction')
  return res.json()
}

export async function sendChatMessage(message: string, vendor_id?: string) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, vendor_id }),
  })
  if (!res.ok) throw new Error('Chat failed')
  return res.json()
}

export function getRiskColor(risk: string) {
  switch (risk?.toLowerCase()) {
    case 'critical': return '#f85149'
    case 'high': return '#d29922'
    case 'medium': return '#58a6ff'
    case 'low': return '#3fb950'
    default: return '#8b949e'
  }
}

export function getRiskClass(risk: string) {
  switch (risk?.toLowerCase()) {
    case 'critical': return 'risk-critical bg-risk-critical'
    case 'high': return 'risk-high bg-risk-high'
    case 'medium': return 'risk-medium bg-risk-medium'
    case 'low': return 'risk-low bg-risk-low'
    default: return 'text-gray-400'
  }
}

export function getTrendIcon(trend: string) {
  if (trend === 'improving') return '↑'
  if (trend === 'declining') return '↓'
  return '→'
}

export function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}
