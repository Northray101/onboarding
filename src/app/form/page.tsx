'use client'

export const dynamic = 'force-static'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, type Form, type Question } from '@/lib/supabase'

const E = [0.16, 1, 0.3, 1] as [number, number, number, number]

const slideVars = {
  enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, y: 0 },
  exit:  (dir: number) => ({ opacity: 0, y: dir > 0 ? -28 : 28 }),
}

function FormInner() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug')

  const [form, setForm]       = useState<Form | null>(null)
  const [questions, setQ]     = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [index, setIndex]     = useState(0)
  const [dir, setDir]         = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const startTime = useRef(Date.now())

  useEffect(() => {
    if (!slug) { setError('No form specified.'); setLoading(false); return }
    async function load() {
      const { data: f } = await supabase.from('forms').select('*').eq('slug', slug!).eq('is_published', true).single()
      if (!f) { setError('Form not found or not published.'); setLoading(false); return }
      setForm(f)
      const { data: q } = await supabase.from('questions').select('*').eq('form_id', f.id).order('position')
      setQ(q ?? [])
      setLoading(false)
    }
    load()
  }, [slug])

  const current   = questions[index]
  const isFirst   = index === 0
  const isLast    = index === questions.length - 1
  const isThanks  = current?.type === 'thank_you'
  const progress  = questions.length > 1 ? (index / (questions.length - 1)) * 100 : 0

  function canAdvance() {
    if (!current) return false
    if (current.type === 'welcome' || current.type === 'thank_you') return true
    if (!current.config.required) return true
    const a = answers[current.id]
    return a !== undefined && a !== null && a !== ''
  }

  async function advance() {
    if (!canAdvance()) return
    if (isLast || isThanks) { await submit(); return }
    setDir(1); setIndex(i => i + 1)
  }

  function back() {
    if (isFirst) return
    setDir(-1); setIndex(i => i - 1)
  }

  async function submit() {
    setSubmitting(true)
    await supabase.from('responses').insert({ form_id: form!.id, answers })
    setSubmitted(true)
    setSubmitting(false)
  }

  const primary = form?.theme?.primary ?? '#c9a84c'
  const bg      = form?.theme?.bg      ?? '#090909'

  /* ── Loading ── */
  if (loading) return (
    <div style={{ background: bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="anim-spin" style={{ width: 24, height: 24, borderRadius: '50%', border: `1px solid rgba(255,255,255,0.1)`, borderTopColor: primary }} />
    </div>
  )

  /* ── Error ── */
  if (error) return (
    <div style={{ background: bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 300, color: 'var(--text)', marginBottom: 12 }}>Oops.</p>
        <p style={{ color: 'var(--text-60)', fontSize: '0.93rem' }}>{error}</p>
      </div>
    </div>
  )

  /* ── Submitted ── */
  if (submitted) {
    const thanks = questions.find(q => q.type === 'thank_you')
    return (
      <div style={{ background: bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, position: 'relative', overflow: 'hidden' }}>
        <div className="fixed pointer-events-none" style={{ inset: 0, background: `radial-gradient(ellipse at 50% 60%, ${primary}10 0%, transparent 65%)` }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: E }}
          style={{ textAlign: 'center', maxWidth: 480, position: 'relative', zIndex: 1 }}
        >
          {/* Check mark */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 180, damping: 18 }}
            style={{
              width: 64, height: 64, borderRadius: '50%',
              border: `1px solid ${primary}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 36px',
              color: primary,
              fontSize: 24,
            }}
          >
            ✓
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7, ease: E }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 300, color: 'var(--text)', lineHeight: 1.05, marginBottom: 20 }}
          >
            {thanks?.title ?? 'Thank you.'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            style={{ color: 'var(--text-60)', fontSize: '1rem', lineHeight: 1.75 }}
          >
            {thanks?.subtitle ?? "Your responses have been recorded. We'll be in touch soon."}
          </motion.p>
        </motion.div>
      </div>
    )
  }

  /* ── Form ── */
  return (
    <div style={{ background: bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

      {/* Ambient glow */}
      <div className="fixed pointer-events-none" style={{ inset: 0, background: `radial-gradient(ellipse at 30% 40%, ${primary}07 0%, transparent 60%)` }} />

      {/* Progress line */}
      <div className="fixed" style={{ top: 0, left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.05)', zIndex: 50 }}>
        <motion.div
          style={{ height: '100%', background: primary, transformOrigin: 'left' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: E }}
        />
      </div>

      {/* Top meta */}
      <div className="fixed" style={{ top: 0, left: 0, right: 0, padding: '20px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 40 }}>
        {form && (
          <span className="caps" style={{ color: 'rgba(255,255,255,0.18)', fontSize: '10px' }}>
            {form.client_name ? `For ${form.client_name}` : form.title}
          </span>
        )}
        {!isThanks && questions.length > 1 && (
          <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: '12px', fontWeight: 300 }}>
            {index + 1}<span style={{ opacity: 0.4 }}> / {questions.length}</span>
          </span>
        )}
      </div>

      {/* Main question area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '80px 40px', position: 'relative', zIndex: 10 }}>
        <div style={{ width: '100%', maxWidth: 680, margin: '0 auto' }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={current?.id ?? 'empty'}
              custom={dir}
              variants={slideVars}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.42, ease: E }}
            >
              {current && (
                <SlideContent
                  question={current}
                  answer={answers[current.id]}
                  onChange={val => setAnswers(a => ({ ...a, [current.id]: val }))}
                  onEnter={advance}
                  primary={primary}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed" style={{ bottom: 0, left: 0, right: 0, padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 40 }}>
        {!isFirst ? (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            whileHover={{ x: -2 }}
            onClick={back}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.28)', fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            ← Back
          </motion.button>
        ) : <div />}

        {!isThanks && (
          <motion.button
            whileHover={{ scale: canAdvance() ? 1.02 : 1 }}
            whileTap={{ scale: canAdvance() ? 0.98 : 1 }}
            onClick={advance}
            disabled={!canAdvance() || submitting}
            style={{
              padding: '12px 32px',
              border: `1px solid ${canAdvance() ? primary : 'rgba(255,255,255,0.12)'}`,
              background: canAdvance() ? primary : 'transparent',
              color: canAdvance() ? bg : 'rgba(255,255,255,0.25)',
              fontFamily: 'var(--font-ui)',
              fontSize: '12px',
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              borderRadius: 2,
              cursor: canAdvance() && !submitting ? 'pointer' : 'not-allowed',
              transition: 'all 0.25s',
              fontWeight: 500,
            }}
          >
            {submitting ? 'Submitting…' : isLast ? 'Submit' : 'Continue →'}
          </motion.button>
        )}
      </div>
    </div>
  )
}

export default function FormPage() {
  return (
    <Suspense fallback={<div style={{ background: '#090909', minHeight: '100vh' }} />}>
      <FormInner />
    </Suspense>
  )
}

/* ── Slide Content ── */
function SlideContent({ question: q, answer, onChange, onEnter, primary }: {
  question: Question; answer: unknown; onChange: (v: unknown) => void
  onEnter: () => void; primary: string
}) {
  const filled = answer !== undefined && answer !== null && answer !== ''

  return (
    <div>
      {/* Question number — small, elegant */}
      {q.type !== 'welcome' && q.type !== 'thank_you' && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
          style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: `${primary}70`, marginBottom: 20, letterSpacing: '0.04em' }}
        >
          ——
        </motion.p>
      )}

      {/* Question title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.65, ease: E }}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(36px, 5.5vw, 68px)',
          fontWeight: 300,
          color: 'var(--text)',
          lineHeight: 1.08,
          letterSpacing: '-0.015em',
          marginBottom: q.subtitle ? 16 : 0,
        }}
      >
        {q.title}
        {q.config.required && <span style={{ color: primary, fontSize: '0.5em', verticalAlign: 'super', marginLeft: 4 }}>*</span>}
      </motion.h1>

      {/* Subtitle */}
      {q.subtitle && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ color: 'var(--text-60)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 0 }}
        >
          {q.subtitle}
        </motion.p>
      )}

      {/* ── Input types ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.55, ease: E }}>

        {/* Short text / email / phone */}
        {(q.type === 'short_text' || q.type === 'email' || q.type === 'phone') && (
          <div style={{ marginTop: 40 }}>
            <input
              autoFocus
              type={q.type === 'email' ? 'email' : q.type === 'phone' ? 'tel' : 'text'}
              value={(answer as string) ?? ''}
              onChange={e => onChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onEnter()}
              placeholder={q.config.placeholder || 'Type your answer…'}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${filled ? primary : 'rgba(255,255,255,0.15)'}`,
                color: 'var(--text)',
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(20px, 3vw, 30px)',
                fontWeight: 300,
                padding: '8px 0 12px',
                transition: 'border-color 0.3s',
                outline: 'none',
              }}
            />
            <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '11px', marginTop: 8, letterSpacing: '0.04em' }}>
              Press Enter ↵ to continue
            </p>
          </div>
        )}

        {/* Long text */}
        {q.type === 'long_text' && (
          <div style={{ marginTop: 40 }}>
            <textarea
              autoFocus
              value={(answer as string) ?? ''}
              onChange={e => onChange(e.target.value)}
              placeholder={q.config.placeholder || 'Your answer…'}
              rows={4}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${filled ? primary : 'rgba(255,255,255,0.15)'}`,
                borderLeft: filled ? `1px solid ${primary}30` : 'none',
                color: 'var(--text)',
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(18px, 2.5vw, 24px)',
                fontWeight: 300,
                padding: filled ? '12px 16px 12px' : '8px 0 12px',
                transition: 'all 0.3s',
                outline: 'none',
                resize: 'none',
                lineHeight: 1.6,
              }}
            />
          </div>
        )}

        {/* Yes / No */}
        {q.type === 'yes_no' && (
          <div style={{ display: 'flex', gap: 16, marginTop: 44 }}>
            {['Yes', 'No'].map(opt => (
              <button
                key={opt}
                onClick={() => onChange(opt)}
                style={{
                  flex: 1, padding: '18px 24px',
                  background: answer === opt ? `${primary}15` : 'transparent',
                  border: `1px solid ${answer === opt ? primary : 'rgba(255,255,255,0.14)'}`,
                  borderRadius: 2,
                  color: answer === opt ? primary : 'rgba(255,255,255,0.55)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  fontWeight: 300,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  transition: 'all 0.22s',
                }}
                onMouseEnter={e => {
                  if (answer !== opt) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = `${primary}50`
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'
                  }
                }}
                onMouseLeave={e => {
                  if (answer !== opt) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.14)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)'
                  }
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Multiple choice */}
        {q.type === 'multiple_choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 44 }}>
            {(q.config.options ?? []).map((opt, i) => {
              const isSel = answer === opt
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: E }}
                  onClick={() => onChange(opt)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '14px 18px',
                    background: isSel ? `${primary}0d` : 'transparent',
                    border: `1px solid ${isSel ? primary : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={e => {
                    if (!isSel) (e.currentTarget as HTMLButtonElement).style.borderColor = `${primary}50`
                  }}
                  onMouseLeave={e => {
                    if (!isSel) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'
                  }}
                >
                  {/* Letter key */}
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '13px',
                    color: isSel ? primary : 'rgba(255,255,255,0.28)',
                    width: 20,
                    flexShrink: 0,
                    transition: 'color 0.2s',
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {/* Vertical divider */}
                  <div style={{ width: 1, height: 20, background: isSel ? `${primary}40` : 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(16px, 2vw, 20px)',
                    fontWeight: 300,
                    color: isSel ? 'var(--text)' : 'rgba(255,255,255,0.65)',
                    transition: 'color 0.2s',
                    flex: 1,
                  }}>
                    {opt}
                  </span>
                  {isSel && (
                    <motion.span
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      style={{ color: primary, fontSize: '14px', flexShrink: 0 }}
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.button>
              )
            })}
          </div>
        )}

        {/* Rating */}
        {q.type === 'rating' && (
          <div style={{ display: 'flex', gap: 10, marginTop: 44, flexWrap: 'wrap' }}>
            {[...Array(q.config.max_rating ?? 5)].map((_, i) => {
              const val = i + 1
              const isActive = (answer as number) >= val
              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => onChange(val)}
                  style={{
                    width: 52, height: 52,
                    border: `1px solid ${isActive ? primary : 'rgba(255,255,255,0.14)'}`,
                    background: isActive ? `${primary}14` : 'transparent',
                    color: isActive ? primary : 'rgba(255,255,255,0.35)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: 300,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {val}
                </motion.button>
              )
            })}
          </div>
        )}

        {/* Welcome CTA */}
        {q.type === 'welcome' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6, ease: E }}
            style={{ marginTop: 52 }}
          >
            <button
              onClick={onEnter}
              style={{
                padding: '14px 36px',
                border: `1px solid ${primary}`,
                background: primary,
                color: '#090909',
                fontFamily: 'var(--font-ui)',
                fontSize: '12px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Begin →
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
