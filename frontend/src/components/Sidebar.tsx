'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const NAV = [
  { href: '/', label: 'Dashboard', icon: '⬡' },
  { href: '/vendors', label: 'Vendors', icon: '◈' },
  { href: '/risk', label: 'Risk Intelligence', icon: '◉' },
  { href: '/predict', label: 'Predictions', icon: '◎' },
  { href: '/assistant', label: 'AI Assistant', icon: '✦' },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside style={{ width: 220, minHeight: '100vh', background: 'var(--color-card)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', padding: '24px 0' }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--color-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>VS</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', color: '#e6edf3' }}>VendorSense</div>
            <div style={{ fontSize: 10, color: 'var(--color-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AI Intelligence</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {NAV.map(item => {
          const active = path === item.href || (item.href !== '/' && path.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 20px', margin: '2px 8px', borderRadius: 8,
                background: active ? 'rgba(37,163,112,0.12)' : 'transparent',
                borderLeft: active ? '2px solid var(--color-brand)' : '2px solid transparent',
                color: active ? 'var(--color-brand)' : 'var(--color-muted)',
                fontWeight: active ? 600 : 400, fontSize: 14,
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)', marginTop: 'auto' }}>
        <div style={{ fontSize: 11, color: 'var(--color-muted)', marginBottom: 4 }}>AI Model Status</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 6px var(--color-success)' }}></div>
          <span style={{ fontSize: 12, color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>Models Active</span>
        </div>
      </div>
    </aside>
  )
}
