'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

interface Admin { id: number; name: string; phone: string }
interface CargoStat {
  id: number
  name: string
  slug: string
  ereemReceiver: string
  ereemPhone: string
  ereemRegion: string
  ereemAddress: string
  logoUrl: string | null
  bankName: string | null
  bankAccountHolder: string | null
  bankAccountNumber: string | null
  bankTransferNote: string | null
  notificationsEnabled: boolean
  searchByPhone: boolean
  paidUntil: string | null
  createdAt: string
  admins: Admin[]
  totalUsers: number
  totalShipments: number
}

function paidUntilColor(paidUntil: string | null): string {
  if (!paidUntil) return 'var(--muted)'
  const days = Math.floor((new Date(paidUntil).getTime() - Date.now()) / 86400000)
  if (days < 0) return '#ef4444'
  if (days < 7) return '#f97316'
  if (days < 30) return '#eab308'
  return '#22c55e'
}

function paidUntilLabel(paidUntil: string | null): string {
  if (!paidUntil) return ''
  const d = new Date(paidUntil)
  const days = Math.floor((d.getTime() - Date.now()) / 86400000)
  const label = `${d.getMonth() + 1}/${d.getDate()}`
  if (days < 0) return `⛔ Дууссан (${label})`
  if (days === 0) return `⚠ Өнөөдөр дуусна`
  if (days < 30) return `⚠ ${label} хүртэл (${days}хоног)`
  return `✓ ${label} хүртэл`
}

interface EditState {
  name: string
  slug: string
  ereemReceiver: string
  ereemPhone: string
  ereemRegion: string
  ereemAddress: string
  logoUrl: string
  bankName: string
  bankAccountHolder: string
  bankAccountNumber: string
  bankTransferNote: string
}

interface SuperBanner { id: number; content: string; imageUrl: string | null; expiresAt: string | null; createdAt: string }

function SuperBannerSection() {
  const [banner, setBanner] = useState<SuperBanner | null | undefined>(undefined)
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [confirmNew, setConfirmNew] = useState(false)
  const [pendingForm, setPendingForm] = useState<{ content: string; imageUrl: string; expiresAt: string } | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewing, setPreviewing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/super/banner').then(r => r.json()).then(d => setBanner(d)).catch(() => setBanner(null))
  }, [])

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImg(true); setError('')
    try {
      const sigRes = await fetch('/api/admin/banner/upload-signature')
      const { signature, timestamp, publicId, folder, apiKey, cloudName } = await sigRes.json()
      const formData = new FormData()
      formData.append('file', file); formData.append('api_key', apiKey)
      formData.append('timestamp', timestamp); formData.append('signature', signature)
      formData.append('folder', folder); formData.append('public_id', publicId)
      const upRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData })
      const data = await upRes.json()
      if (!upRes.ok) throw new Error(data.error?.message ?? 'Upload алдаа')
      setImageUrl(data.secure_url)
    } catch { setError('Зураг upload хийхэд алдаа гарлаа') }
    finally { setUploadingImg(false); if (fileRef.current) fileRef.current.value = '' }
  }

  function handleSubmit() {
    setError('')
    if (!content.trim()) { setError('Мэдэгдлийн текст хоосон байна'); return }
    if (banner) { setPendingForm({ content, imageUrl, expiresAt }); setConfirmNew(true) }
    else { doSave(content, imageUrl, expiresAt) }
  }

  async function doSave(c: string, img: string, exp: string) {
    setSaving(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/super/banner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: c, imageUrl: img || null, expiresAt: exp || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBanner(data); setContent(''); setImageUrl(''); setExpiresAt('')
      setSuccess('Мэдэгдэл үүслээ'); setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) { setError(err.message ?? 'Алдаа гарлаа') }
    finally { setSaving(false) }
  }

  async function deleteBanner() {
    setSaving(true)
    await fetch('/api/super/banner', { method: 'DELETE' })
    setBanner(null); setSaving(false)
    setSuccess('Мэдэгдэл устгагдлаа'); setTimeout(() => setSuccess(''), 3000)
  }

  if (banner === undefined) return <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Ачааллаж байна...</p>

  const previewData = { id: 0, content: content.trim() || banner?.content || '', imageUrl: imageUrl || banner?.imageUrl || null, expiresAt: expiresAt || banner?.expiresAt || null, createdAt: '' }

  return (
    <>
      {previewing && (
        <div onClick={() => setPreviewing(false)} style={{ position: 'fixed', inset: 0, zIndex: 9500, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(2px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', borderRadius: 16, padding: '1.75rem 1.5rem 1.5rem', maxWidth: 420, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.28)', border: '1px solid var(--accent)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-1px', left: '1.5rem', background: 'var(--accent)', color: '#fff', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', padding: '0.15rem 0.7rem', borderRadius: '0 0 6px 6px', textTransform: 'uppercase' }}>Системийн мэдэгдэл</div>
            <div style={{ position: 'absolute', top: '-2rem', right: 0, background: 'rgba(0,0,0,0.7)', borderRadius: 100, padding: '0.2rem 0.8rem', fontSize: '0.72rem', color: '#fff', whiteSpace: 'nowrap' }}>👁 Admin-ийн харагдах байдал</div>
            <button onClick={() => setPreviewing(false)} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'var(--surface2)', border: 'none', cursor: 'pointer', color: 'var(--muted)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>✕</button>
            {previewData.imageUrl && <img src={previewData.imageUrl} alt="" style={{ width: '100%', borderRadius: 10, marginBottom: '1rem', maxHeight: 240, objectFit: 'cover' }} />}
            <p style={{ fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: '0.5rem' }}>{previewData.content}</p>
            {previewData.expiresAt && <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.75rem' }}>{new Date(previewData.expiresAt).toLocaleString('mn-MN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })} хүртэл</p>}
            <button className="btn" style={{ marginTop: '1.25rem', width: '100%' }}>Ойлголоо</button>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--accent)' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
          Бүх adminд харуулах мэдэгдэл
        </p>

        {banner && (
          <div style={{ background: 'var(--accent-light)', borderRadius: 10, padding: '1rem', border: '1px solid #f0c9b5', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.35rem' }}>Идэвхтэй мэдэгдэл</p>
                {banner.imageUrl && <img src={banner.imageUrl} alt="" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8, marginBottom: '0.5rem' }} />}
                <p style={{ fontSize: '0.88rem', whiteSpace: 'pre-wrap', color: 'var(--text)', marginBottom: '0.35rem' }}>{banner.content}</p>
                {banner.expiresAt
                  ? <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Дуусах: {new Date(banner.expiresAt).toLocaleString('mn-MN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  : <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Цаггүй — гар аргаар устгах хүртэл</p>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <button onClick={() => setPreviewing(true)} style={{ background: 'none', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 8, padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>👁 Харах</button>
                <button onClick={deleteBanner} disabled={saving} style={{ background: 'none', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: 8, padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Устгах</button>
              </div>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Мэдэгдлийн текст <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '0.78rem' }}>(emoji, тэмдэгт дэмжинэ)</span></label>
          <textarea className="input" rows={3} placeholder="Системийн шинэчлэл хийгдэнэ..." value={content} onChange={e => setContent(e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
        </div>

        <div className="form-group">
          <label>Зураг <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '0.78rem' }}>(заавал биш)</span></label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingImg} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 0.9rem', cursor: 'pointer', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.85rem' }}>
              {uploadingImg ? 'Байршуулж байна...' : '📎 Зураг сонгох'}
            </button>
            {imageUrl && (<><img src={imageUrl} alt="" style={{ height: 48, borderRadius: 6, objectFit: 'cover' }} /><button onClick={() => setImageUrl('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: '0.85rem' }}>✕ Хасах</button></>)}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageFile} />
        </div>

        <div className="form-group">
          <label>Дуусах цаг <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '0.78rem' }}>(хоосон бол гар аргаар устгах хүртэл)</span></label>
          <input className="input" type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} style={{ maxWidth: 240 }} />
        </div>

        {error && <p className="msg-error" style={{ marginBottom: '0.75rem' }}>{error}</p>}
        {success && <p style={{ fontSize: '0.82rem', color: 'var(--green)', marginBottom: '0.75rem' }}>✓ {success}</p>}

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button onClick={() => { if (content.trim()) setPreviewing(true); else setError('Эхлээд текст бичнэ үү') }} disabled={uploadingImg} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.7rem 1.2rem', cursor: 'pointer', color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.875rem', fontWeight: 600 }}>
            👁 Урьдчилан харах
          </button>
          <button className="btn" onClick={handleSubmit} disabled={saving || uploadingImg || !content.trim()}>
            {saving ? 'Хадгалж байна...' : banner ? 'Шинэ мэдэгдэл тохируулах' : 'Мэдэгдэл илгээх'}
          </button>
        </div>

        {confirmNew && pendingForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
            <div className="card" style={{ width: '100%', maxWidth: 360, padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>⚠️ Анхааруулга</p>
              <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>Одоо байгаа мэдэгдэл <strong style={{ color: 'var(--danger)' }}>устгагдаж</strong> шинэ мэдэгдэл үүснэ.</p>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button className="btn" onClick={() => { setConfirmNew(false); doSave(pendingForm.content, pendingForm.imageUrl, pendingForm.expiresAt); setPendingForm(null) }} style={{ flex: 1 }}>Тийм</button>
                <button onClick={() => { setConfirmNew(false); setPendingForm(null) }} style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}>Болих</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default function SuperPage() {
  const [cargos, setCargos] = useState<CargoStat[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<EditState>({ name: '', slug: '', ereemReceiver: '', ereemPhone: '', ereemRegion: '', ereemAddress: '', logoUrl: '', bankName: '', bankAccountHolder: '', bankAccountNumber: '', bankTransferNote: '' })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [pwModal, setPwModal] = useState<{ userId: number; name: string } | null>(null)
  const [pwInput, setPwInput] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const [paidDates, setPaidDates] = useState<Record<number, string>>({})
  const [paidSaving, setPaidSaving] = useState(false)
  const [paidMsg, setPaidMsg] = useState('')

  async function resetPassword() {
    if (!pwModal || pwInput.length < 6) return
    setPwLoading(true)
    const res = await fetch('/api/super/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: pwModal.userId, newPassword: pwInput }),
    })
    setPwLoading(false)
    if (res.ok) { setPwMsg('✓ Нууц үг шинэчлэгдлээ'); setPwInput('') }
    else { const d = await res.json(); setPwMsg(d.error || 'Алдаа гарлаа') }
  }
  function load() {
    setLoading(true)
    fetch('/api/super/cargos')
      .then(r => r.json())
      .then(data => {
        setCargos(data)
        setLoading(false)
        const init: Record<number, string> = {}
        for (const c of data) init[c.id] = c.paidUntil ? c.paidUntil.slice(0, 10) : ''
        setPaidDates(init)
      })
      .catch(() => setLoading(false))
  }

  async function saveAllPaid() {
    setPaidSaving(true)
    setPaidMsg('')
    await Promise.all(
      Object.entries(paidDates).map(([id, date]) =>
        fetch(`/api/super/cargo/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paidUntil: date || null }),
        })
      )
    )
    setPaidSaving(false)
    setPaidMsg('✓ Хадгалагдлаа')
    setTimeout(() => setPaidMsg(''), 2500)
    load()
  }

  useEffect(() => { load() }, [])

  function startEdit(c: CargoStat) {
    setEditId(c.id)
    setEditForm({ name: c.name, slug: c.slug, ereemReceiver: c.ereemReceiver, ereemPhone: c.ereemPhone, ereemRegion: c.ereemRegion ?? '', ereemAddress: c.ereemAddress, logoUrl: c.logoUrl ?? '', bankName: c.bankName ?? '', bankAccountHolder: c.bankAccountHolder ?? '', bankAccountNumber: c.bankAccountNumber ?? '', bankTransferNote: c.bankTransferNote ?? '' })
    setEditError('')
  }

  async function saveEdit(id: number) {
    setEditLoading(true)
    setEditError('')
    const res = await fetch(`/api/super/cargo/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    const data = await res.json()
    setEditLoading(false)
    if (!res.ok) { setEditError(data.error); return }
    setEditId(null)
    load()
  }

  return (
    <>
      <SuperBannerSection />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="section-title" style={{ margin: 0 }}>Карго компаниуд ({cargos.length})</h1>
        <Link href="/super/cargo/new" className="btn" style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem' }}>
          + Шинэ карго
        </Link>
      </div>

      {/* Paid until bulk editor */}
      {!loading && cargos.length > 0 && (
        <div className="card" style={{ padding: '1.2rem 1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Вэбийн төлбөр хүртэлх огноо</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {paidMsg && <span style={{ fontSize: '0.82rem', color: '#22c55e' }}>{paidMsg}</span>}
              <button className="btn" onClick={saveAllPaid} disabled={paidSaving} style={{ fontSize: '0.82rem', padding: '0.4rem 1.2rem' }}>
                {paidSaving ? 'Хадгалж...' : 'Хадгалах'}
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.6rem' }}>
            {cargos.map(c => (
              <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.6rem 0.75rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{c.name}</span>
                  {paidDates[c.id] && (
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: paidUntilColor(paidDates[c.id] ? new Date(paidDates[c.id]).toISOString() : null) }}>
                      {paidUntilLabel(paidDates[c.id] ? new Date(paidDates[c.id]).toISOString() : null)}
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  value={paidDates[c.id] ?? ''}
                  onChange={e => setPaidDates(prev => ({ ...prev, [c.id]: e.target.value }))}
                  style={{ fontSize: '0.82rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '0.3rem 0.5rem', color: 'var(--text)', fontFamily: 'inherit', width: '100%' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cargo cards */}
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Ачааллаж байна...</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {cargos.map(c => (
            <div key={c.id} className="card" style={{ padding: '1.3rem 1.5rem' }}>
              {editId === c.id ? (
                /* ── Edit mode ── */
                <div>
                  {/* Logo upload */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginBottom: '0.4rem' }}>Лого</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {editForm.logoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={editForm.logoUrl} alt="logo" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 4, border: '1px solid var(--border)' }} />
                      )}
                      <input type="file" accept="image/*" style={{ fontSize: '0.82rem' }}
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const img = new Image()
                          const url = URL.createObjectURL(file)
                          img.onload = () => {
                            const MAX = 400
                            const scale = Math.min(MAX / img.width, MAX / img.height, 1)
                            const w = Math.round(img.width * scale)
                            const h = Math.round(img.height * scale)
                            const canvas = document.createElement('canvas')
                            canvas.width = w
                            canvas.height = h
                            const ctx = canvas.getContext('2d')!
                            ctx.drawImage(img, 0, 0, w, h)
                            setEditForm(f => ({ ...f, logoUrl: canvas.toDataURL('image/png', 1) }))
                            URL.revokeObjectURL(url)
                          }
                          img.src = url
                        }} />
                      {editForm.logoUrl && (
                        <button onClick={() => setEditForm(f => ({ ...f, logoUrl: '' }))}
                          style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.78rem' }}>
                          Устгах
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>Нэр</label>
                      <input className="input" value={editForm.name}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>
                        Slug <span style={{ color: 'var(--danger)', fontWeight: 400 }}>⚠ subdomain өөрчлөгдөнө</span>
                      </label>
                      <input className="input" value={editForm.slug}
                        onChange={e => setEditForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>收货人</label>
                      <input className="input" value={editForm.ereemReceiver}
                        onChange={e => setEditForm(f => ({ ...f, ereemReceiver: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>手机号</label>
                      <input className="input" value={editForm.ereemPhone}
                        onChange={e => setEditForm(f => ({ ...f, ereemPhone: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>地区</label>
                      <input className="input" placeholder="内蒙古·二连浩特市" value={editForm.ereemRegion}
                        onChange={e => setEditForm(f => ({ ...f, ereemRegion: e.target.value }))} />
                    </div>
                    <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '0.75rem' }}>详细地址</label>
                      <input className="input" value={editForm.ereemAddress}
                        onChange={e => setEditForm(f => ({ ...f, ereemAddress: e.target.value }))} />
                    </div>
                  </div>

                  {/* Bank fields */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
                    <p style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Төлбөр төлөх данс</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Банкны нэр</label>
                        <input className="input" placeholder="Хаан банк" value={editForm.bankName}
                          onChange={e => setEditForm(f => ({ ...f, bankName: e.target.value }))} />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Хүлээн авагчийн нэр</label>
                        <input className="input" placeholder="Овог Нэр" value={editForm.bankAccountHolder}
                          onChange={e => setEditForm(f => ({ ...f, bankAccountHolder: e.target.value }))} />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Дансны дугаар</label>
                        <input className="input" placeholder="5000123456" value={editForm.bankAccountNumber}
                          onChange={e => setEditForm(f => ({ ...f, bankAccountNumber: e.target.value }))} />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Гүйлгээний утга</label>
                        <input className="input" placeholder="Утасны дугаараа заавал бичнэ үү" value={editForm.bankTransferNote}
                          onChange={e => setEditForm(f => ({ ...f, bankTransferNote: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                  {editError && <p className="msg-error" style={{ margin: '0 0 0.5rem' }}>{editError}</p>}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn" onClick={() => saveEdit(c.id)} disabled={editLoading} style={{ fontSize: '0.82rem', padding: '0.4rem 1rem' }}>
                      {editLoading ? 'Хадгалж...' : 'Хадгалах'}
                    </button>
                    <button onClick={() => setEditId(null)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 'var(--radius)', padding: '0.4rem 0.9rem', cursor: 'pointer', fontSize: '0.82rem' }}>
                      Болих
                    </button>
                  </div>
                </div>
              ) : (
                /* ── View mode ── */
                <div>
                  {/* Top row: name + slug + edit button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <strong style={{ fontSize: '1rem' }}>{c.name}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'monospace', background: 'var(--surface2,#1a1a1a)', padding: '0.1rem 0.5rem', borderRadius: 4 }}>
                        {c.slug}
                      </span>
                      {c.admins.length === 0 && (
                        <span style={{ fontSize: '0.72rem', color: '#f97316', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 4, padding: '0.1rem 0.5rem' }}>
                          Админгүй
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={async () => {
                          await fetch(`/api/super/cargo/${c.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ notificationsEnabled: !c.notificationsEnabled }),
                          })
                          load()
                        }}
                        style={{
                          background: c.notificationsEnabled ? 'rgba(34,197,94,0.12)' : 'none',
                          border: `1px solid ${c.notificationsEnabled ? '#22c55e' : 'var(--border)'}`,
                          color: c.notificationsEnabled ? '#22c55e' : 'var(--muted)',
                          borderRadius: 'var(--radius)', padding: '0.3rem 0.8rem',
                          cursor: 'pointer', fontSize: '0.78rem', whiteSpace: 'nowrap', fontFamily: 'inherit',
                        }}
                      >
                        {c.notificationsEnabled ? '🔔 Мэдэгдэл: Тийм' : '🔕 Мэдэгдэл: Үгүй'}
                      </button>
                      <button
                        onClick={async () => {
                          await fetch(`/api/super/cargo/${c.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ searchByPhone: !c.searchByPhone }),
                          })
                          load()
                        }}
                        style={{
                          background: c.searchByPhone ? 'rgba(99,102,241,0.12)' : 'none',
                          border: `1px solid ${c.searchByPhone ? '#6366f1' : 'var(--border)'}`,
                          color: c.searchByPhone ? '#6366f1' : 'var(--muted)',
                          borderRadius: 'var(--radius)', padding: '0.3rem 0.8rem',
                          cursor: 'pointer', fontSize: '0.78rem', whiteSpace: 'nowrap', fontFamily: 'inherit',
                        }}
                      >
                        {c.searchByPhone ? '📱 Утас хайлт: Тийм' : '📱 Утас хайлт: Үгүй'}
                      </button>
                      <button onClick={() => startEdit(c)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 'var(--radius)', padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        Засах
                      </button>
                    </div>
                  </div>

                  {/* Stats + Admins row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      {c.admins.length > 0 ? (
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          {c.admins.map(a => (
                            <span key={a.id} style={{ fontSize: '0.82rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              {a.name} <span style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>{a.phone}</span>
                              <button onClick={() => { setPwModal({ userId: a.id, name: a.name }); setPwInput(''); setPwMsg('') }} title="Нууц үг солих" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '0.1rem 0.3rem', color: 'var(--muted)' }}>🔑</button>
                            </span>
                          ))}
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>— Админ</span>
                        </div>
                      ) : (
                        <Link href="/super/assign-admin" style={{ fontSize: '0.82rem', color: 'var(--accent)' }}>
                          + Админ томилох
                        </Link>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '1.2rem', flexShrink: 0, alignItems: 'center' }}>
                      {c.paidUntil && (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: paidUntilColor(c.paidUntil), whiteSpace: 'nowrap' }}>
                          {paidUntilLabel(c.paidUntil)}
                        </span>
                      )}
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{c.totalUsers}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '0.15rem' }}>хэрэглэгч</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{c.totalShipments}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: '0.15rem' }}>ачаа</div>
                      </div>
                    </div>
                  </div>

                  {/* Ereen address */}
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.7, borderTop: '1px solid var(--border)', paddingTop: '0.7rem' }}>
                    <span style={{ marginRight: '1.2rem' }}>收货人: <span style={{ color: 'var(--text)' }}>{c.ereemReceiver}</span></span>
                    <span style={{ marginRight: '1.2rem' }}>手机号: <span style={{ color: 'var(--text)' }}>{c.ereemPhone}</span></span>
                    {c.ereemRegion && <span style={{ marginRight: '1.2rem' }}>地区: <span style={{ color: 'var(--text)' }}>{c.ereemRegion}</span></span>}
                    <span>详细地址: <span style={{ color: 'var(--text)' }}>{c.ereemAddress}</span></span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pwModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 360, padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', fontWeight: 700 }}>Нууц үг солих — {pwModal.name}</h3>
            <div className="form-group">
              <label>Шинэ нууц үг <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>(хамгийн багадаа 6 тэмдэгт)</span></label>
              <input
                className="input"
                type="password"
                placeholder="Шинэ нууц үг"
                value={pwInput}
                onChange={e => { setPwInput(e.target.value); setPwMsg('') }}
                autoFocus
              />
            </div>
            {pwMsg && <p style={{ fontSize: '0.82rem', color: pwMsg.startsWith('✓') ? 'var(--green)' : 'var(--danger)', marginBottom: '0.75rem' }}>{pwMsg}</p>}
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button className="btn" onClick={resetPassword} disabled={pwInput.length < 6 || pwLoading} style={{ flex: 1 }}>
                {pwLoading ? '...' : 'Хадгалах'}
              </button>
              <button onClick={() => setPwModal(null)} style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}>
                Болих
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
