'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const E = [0.16, 1, 0.3, 1] as [number, number, number, number]

const PRESETS = [
  { label: 'Brand Design', hint: 'Identity, colors, typography, brand voice' },
  { label: 'Web Design', hint: 'Goals, pages, features, timeline' },
  { label: 'Social Media', hint: 'Platforms, audience, content style' },
  { label: 'Photography', hint: 'Style, location, deliverables, dates' },
  { label: 'Copywriting', hint: 'Tone, audience, channels, keywords' },
  { label: 'Custom', hint: 'Start with a blank form' },
]

const THEMES = [
  { name: 'Champagne', primary: '#c9a84c', accent: '#e8c87a', bg: '#090909' },
  { name: 'Indigo',    primary: '#6366f1', accent: '#818cf8', bg: '#090909' },
  { name: 'Rose',      primary: '#e11d48', accent: '#fb7185', bg: '#090909' },
  { name: 'Teal',      primary: '#0d9488', accent: '#2dd4bf', bg: '#090909' },
  { name: 'Amber',     primary: '#d97706', accent: '#fbbf24', bg: '#090909' },
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
      theme: { primary: theme.primary, accent: theme.accent, bg: theme.bg },
      is_published: false,
    }).select().single()
    if (data && !error) router.push(`/admin/builder?id=${data.id}`)
    setSaving(false)
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div className="fixed pointer-events-none" style={{ bottom: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 65%)' }} />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 40px' }}>
        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-8"
          style={{ paddingTop: 36, paddingBottom: 36, borderBottom: '1px solid var(--border-sub)' }}
        >
          <Link href="/admin">
            <span className="caps" style={{ color: 'var(--text-35)', cursor: 'pointer' }}>← Dashboard</span>
          </Link>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 400 }}>
            New Form
          </span>
        </motion.nav>

        {/* Steps */}
        <div style={{ paddingTop: '8vh', paddingBottom: '8vh' }}>
          <AnimatePresence mode="wait">

            {/* ── Step 0: Template ── */}
            {step === 0 && (
              <motion.div
                key="s0"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: E }}
              >
                <p className="caps" style={{ color: 'var(--gold)', marginBottom: 20 }}>Step 01 — Template</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 300, color: 'var(--text)', marginBottom: 12, lineHeight: 1.05 }}>
                  Choose a<br /><em>starting point.</em>
                </h2>
                <p style={{ color: 'var(--text-60)', marginBottom: 48, fontSize: '0.93rem' }}>
                  Start from a preset or build from scratch.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {PRESETS.map((p, i) => (
                    <motion.button
                      key={p.label}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.06, duration: 0.45, ease: E }}
                      onClick={() => {
                        if (p.label !== 'Custom') setTitle(`${p.label} Onboarding`)
                        setStep(1)
                      }}
                      className="flex items-center justify-between text-left"
                      style={{
                        padding: '18px 20px',
                        background: 'transparent',
                        border: '1px solid var(--border-sub)',
                        borderRadius: 'var(--radius)',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s, background 0.2s',
                        marginBottom: 6,
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
                        ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-sub)'
                        ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                      }}
                    >
                      <div>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, color: 'var(--text)' }}>
                          {p.label}
                        </p>
                        <p style={{ color: 'var(--text-35)', fontSize: '0.8rem', marginTop: 3 }}>{p.hint}</p>
                      </div>
                      <span style={{ color: 'var(--gold)', fontSize: '18px', opacity: 0.6 }}>→</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Step 1: Details ── */}
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: E }}
              >
                <p className="caps" style={{ color: 'var(--gold)', marginBottom: 20 }}>Step 02 — Details</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 300, color: 'var(--text)', marginBottom: 12, lineHeight: 1.05 }}>
                  Name &amp; theme.
                </h2>
                <p style={{ color: 'var(--text-60)', marginBottom: 52, fontSize: '0.93rem' }}>
                  Configure your form before building its slides.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
                  <div>
                    <label className="caps" style={{ color: 'var(--text-35)', display: 'block', marginBottom: 12 }}>
                      Form Title *
                    </label>
                    <input
                      className="input-line"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Brand Design Onboarding"
                      style={{ fontSize: '1.1rem' }}
                    />
                  </div>

                  <div>
                    <label className="caps" style={{ color: 'var(--text-35)', display: 'block', marginBottom: 12 }}>
                      Client Name
                    </label>
                    <input
                      className="input-line"
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      placeholder="e.g. Acme Corporation"
                    />
                  </div>

                  <div>
                    <label className="caps" style={{ color: 'var(--text-35)', display: 'block', marginBottom: 12 }}>
                      Description
                    </label>
                    <textarea
                      className="input-line"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Brief description of this form…"
                      rows={2}
                      style={{ resize: 'none' }}
                    />
                  </div>

                  <div>
                    <label className="caps" style={{ color: 'var(--text-35)', display: 'block', marginBottom: 16 }}>
                      Accent Color
                    </label>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {THEMES.map(t => (
                        <button
                          key={t.name}
                          onClick={() => setTheme(t)}
                          title={t.name}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: t.primary,
                            border: `2px solid ${theme.name === t.name ? 'var(--text)' : 'transparent'}`,
                            outline: theme.name === t.name ? `1px solid ${t.primary}` : 'none',
                            outlineOffset: 3,
                            cursor: 'pointer',
                            transition: 'transform 0.15s',
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
                    <button
                      className="btn-gold"
                      onClick={create}
                      disabled={!title.trim() || saving}
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        opacity: (!title.trim() || saving) ? 0.45 : 1,
                        cursor: (!title.trim() || saving) ? 'not-allowed' : 'pointer',
                      }}
                    >
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
