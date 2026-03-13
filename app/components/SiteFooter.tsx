'use client'
import { useState } from 'react'

const NAME = 'darkhan+ өөрийн утас'
const PHONE = '18647933620'

const CONTACT = [
  { label: '收货人 (Нэр)', value: NAME },
  { label: '手机号 (Утас)', value: PHONE },
  { label: '详细地址 (Хаяг)', value: `环宇商贸城9栋24号нэр+утас+darkhan` },
]

const REGION_OPTIONS = ['内蒙古自治区', '锡林郭勒盟', '二连浩特市']

function CopyItem({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.7rem 0', borderBottom: '1px solid var(--border)', gap: '1rem',
    }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--muted)', flexShrink: 0 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{value}</span>
        <button onClick={copy} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: copied ? 'var(--green)' : 'var(--muted)',
          fontSize: '0.72rem', fontFamily: 'inherit', fontWeight: 600,
          padding: '0.15rem 0.4rem', borderRadius: '4px',
          transition: 'color 0.15s', flexShrink: 0,
        }}>
          {copied ? '✓' : 'Хуулах'}
        </button>
      </div>
    </div>
  )
}

export default function SiteFooter() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--surface)',
      padding: '1.5rem 5%',
      marginTop: '2rem',
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <p style={{
          textAlign: 'center', fontWeight: 700, fontSize: '0.78rem',
          color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase',
          marginBottom: '1rem',
        }}>Aicargo хаяг холбох</p>

        <div style={{ borderTop: '1px solid var(--border)' }}>
          {CONTACT.slice(0, 2).map(c => <CopyItem key={c.label} label={c.label} value={c.value} />)}
          {/* Region breadcrumb */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.7rem 0', borderBottom: '1px solid var(--border)', gap: '1rem',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', flexShrink: 0 }}>地区 (Бүс)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {REGION_OPTIONS.map((opt, i) => (
                <span key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{
                    fontSize: '0.78rem', fontWeight: 500,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '5px', padding: '0.2rem 0.5rem', color: 'var(--text)',
                  }}>{opt}</span>
                  {i < REGION_OPTIONS.length - 1 && <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>›</span>}
                </span>
              ))}
            </div>
          </div>
          {CONTACT.slice(2).map(c => <CopyItem key={c.label} label={c.label} value={c.value} />)}
          <div style={{ paddingTop: '0.7rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>© 2024 Aicargo</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
