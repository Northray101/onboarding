'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const E = [0.16, 1, 0.3, 1] as [number, number, number, number]

const blurUp = (delay = 0) => ({
  initial: { opacity: 0, filter: 'blur(10px)', y: 14 },
  animate: { opacity: 1, filter: 'blur(0px)', y: 0 },
  transition: { duration: 0.65, ease: E, delay },
})

const PRESETS = [
  { label: 'Brand Design',  hint: 'Identity, colors, typography, brand voice' },
  { label: 'Web Design',    hint: 'Goals, pages, features, timeline' },
  { label: 'Social Media',  hint: 'Platforms, audience, content style' },
  { label: 'Photography',   hint: 'Style, location, deliverables, dates' },
  { label: 'Copywriting',   hint: 'Tone, audience, channels, keywords' },
  { label: 'Custom',        hint: 'Start with a blank form' },
]

const THEMES = [
  { name: 'Sky',     primary: '#3a9dc8', accent: '#89c1da' },
  { name: 'Indigo',  primary: '#5a67d8', accent: '#7f8ff4' },
  { name: 'Rose',    primary: '#e05e7e', accent: '#f4a0b5' },
  { name: 'Sage',    primary: '#4a9e7f', accent: '#80c4a8' },
  { name: 'Amber',   primary: '#d97520', accent: '#f5a84b' },
]

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).slice(2, 6)
}

export default function NewFormPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [clientName, setClientName] = useState('')
  const [description, setDescription] = useState('')
  const [theme, setTheme] = useState(THEMES[0])
  const [saving, setSaving] = useState(false)

  async function create() {
    if (!title.trim()) return
    setSaving(true)
    const { data, error } = await supabase.from('forms').insert({
      title,
      client_name: clientName || null,
      description: description || null,
      slug: slugify(title),
      theme: { primary: theme.primary, accent: theme.accent, bg: '#f5f8fc' },
      is_published: false,
    }).select().single()
    if (data && !error) router.push(`/admin/builder?id=${data.id}`)
    setSaving(false)
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div aria-hidden style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '45vh', pointerEvents: 'none', zIndex: 0, background: 'linear-gradient(180deg, rgba(184,221,242,0.28) 0%, transparent 100%)' }} />

      <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 44px', position: 'relative', zIndex: 1 }}>

        {/* Nav */}
        <motion.nav {...blurUp(0)} className="flex items-center gap-6"
          style={{ paddingTop: 32, paddingBottom: 32, borderBottom: '1px solid var(--border-sub)' }}>
          <Link href="/admin">
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '16px', color: 'var(--sky-deep)', cursor: 'pointer' }}>← Dashboard</span>
          </Link>
          <div style={{ width: 1, height: 16, background: 'var(--border-sub)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '22px', color: 'var(--text)' }}>New Form</span>
        </motion.nav>

        <div style={{ paddingTop: '7vh', paddingBottom: '8vh' }}>
          <AnimatePresence mode="wait">

            {/* ── Step 0: Template ── */}
            {step === 0 && (
              <motion.div key="s0"
                initial={{ opacity: 0, filter: 'blur(10px)', y: 14 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                exit={{ opacity: 0, filter: 'blur(6px)', y: -10 }}
                transition={{ duration: 0.5, ease: E }}
              >
                <span className="caps" style={{ color: 'var(--sky)', display: 'block', marginBottom: 18 }}>Step 01</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 100, fontSize: 'clamp(38px, 5.5vw, 58px)', color: 'var(--text)', marginBottom: 8, lineHeight: 1.0, letterSpacing: '-0.025em' }}>
                  Choose a<br /><em>starting point.</em>
                </h2>
                <p style={{ color: 'var(--text-60)', marginBottom: 44, fontSize: '0.93rem', lineHeight: 1.7 }}>
                  Pick a template or start from scratch.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {PRESETS.map((p, i) => (
                    <motion.button
                      key={p.label}
                      initial={{ opacity: 0, filter: 'blur(6px)', x: -10 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
                      transition={{ delay: 0.1 + i * 0.07, duration: 0.45, ease: E }}
                      onClick={() => { if (p.label !== 'Custom') setTitle(`${p.label} Onboarding`); setStep(1) }}
                      className="card flex items-center justify-between text-left"
                      style={{ padding: '16px 20px', cursor: 'pointer', border: '1px solid var(--border-sub)', transition: 'all 0.2s', background: 'var(--bg-card)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--sky-light)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(58,157,200,0.1)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-sub)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)' }}
                    >
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '18px', color: 'var(--text)', marginBottom: 2 }}>{p.label}</p>
                        <p style={{ color: 'var(--text-35)', fontSize: '0.8rem' }}>{p.hint}</p>
                      </div>
                      <span style={{ color: 'var(--sky)', fontSize: '18px', opacity: 0.6, flexShrink: 0 }}>→</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Step 1: Details ── */}
            {step === 1 && (
              <motion.div key="s1"
                initial={{ opacity: 0, filter: 'blur(10px)', y: 14 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                exit={{ opacity: 0, filter: 'blur(6px)', y: -10 }}
                transition={{ duration: 0.5, ease: E }}
              >
                <span className="caps" style={{ color: 'var(--sky)', display: 'block', marginBottom: 18 }}>Step 02</span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 100, fontSize: 'clamp(38px, 5.5vw, 58px)', color: 'var(--text)', marginBottom: 8, lineHeight: 1.0, letterSpacing: '-0.025em' }}>
                  Name &amp;<br /><em>personalise.</em>
                </h2>
                <p style={{ color: 'var(--text-60)', marginBottom: 44, fontSize: '0.93rem' }}>
                  Set up the details before building your slides.
                </p>

                <div className="card" style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 30 }}>
                  <div>
                    <label className="caps" style={{ color: 'var(--text-35)', display: 'block', marginBottom: 10 }}>Form Title *</label>
                    <input className="input-line" value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Brand Design Onboarding" style={{ fontSize: '1.05rem' }} />
                  </div>
                  <div>
                    <label className="caps" style={{ color: 'var(--text-35)', display: 'block', marginBottom: 10 }}>Client Name</label>
                    <input className="input-line" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. Acme Corporation" />
                  </div>
                  <div>
                    <label className="caps" style={{ color: 'var(--text-35)', display: 'block', marginBottom: 10 }}>Description</label>
                    <textarea className="input-line" value={description} onChange={e => setDescription(e.target.value)}
                      placeholder="Brief description of this form…" rows={2} style={{ resize: 'none' }} />
                  </div>

                  <div>
                    <label className="caps" style={{ color: 'var(--text-35)', display: 'block', marginBottom: 14 }}>Accent Colour</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {THEMES.map(t => (
                        <button key={t.name} onClick={() => setTheme(t)} title={t.name}
                          style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: `linear-gradient(135deg, ${t.primary}, ${t.accent})`,
                            border: `2px solid ${theme.name === t.name ? 'var(--text)' : 'transparent'}`,
                            outline: theme.name === t.name ? `2px solid ${t.primary}` : 'none',
                            outlineOffset: 3,
                            cursor: 'pointer', transition: 'transform 0.15s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="rule-sub" />

                  <div className="flex gap-3">
                    <button className="btn-ghost" onClick={() => setStep(0)}>← Back</button>
                    <button className="btn-sky" onClick={create}
                      disabled={!title.trim() || saving}
                      style={{ flex: 1, justifyContent: 'center', opacity: (!title.trim() || saving) ? 0.5 : 1, cursor: (!title.trim() || saving) ? 'not-allowed' : 'pointer' }}>
                      {saving ? 'Creating…' : 'Create & Open Builder →'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
