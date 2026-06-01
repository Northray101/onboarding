'use client'

export const dynamic = 'force-static'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, type Form, type Question } from '@/lib/supabase'

const E = [0.16, 1, 0.3, 1] as [number, number, number, number]

/* Blur-in slide transition — the signature effect */
const slideVars = {
  enter: (dir: number) => ({
    opacity: 0,
    filter: 'blur(14px)',
    y: dir > 0 ? 24 : -24,
  }),
  center: {
    opacity: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: { duration: 0.55, ease: E },
  },
  exit: (dir: number) => ({
    opacity: 0,
    filter: 'blur(10px)',
    y: dir > 0 ? -20 : 20,
    transition: { duration: 0.3, ease: E },
  }),
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

  const current  = questions[index]
  const isFirst  = index === 0
  const isLast   = index === questions.length - 1
  const isThanks = current?.type === 'thank_you'
  const progress = questions.length > 1 ? (index / (questions.length - 1)) * 100 : 0

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

  const primary = form?.theme?.primary ?? '#3a9dc8'
  const accent  = form?.theme?.accent  ?? '#89c1da'

  /* ── Loading ── */
  if (loading) return (
    <div style={{ background: '#f5f8fc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        style={{ width: 8, height: 8, borderRadius: '50%', background: '#3a9dc8' }}
      />
    </div>
  )

  /* ── Error ── */
  if (error) return (
    <div style={{ background: '#f5f8fc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '40px', color: 'var(--text)', marginBottom: 10 }}>Not found.</p>
        <p style={{ color: 'var(--text-60)' }}>{error}</p>
      </div>
    </div>
  )

  /* ── Submitted ── */
  if (submitted) {
    const thanks = questions.find(q => q.type === 'thank_you')
    return (
      <div style={{ background: '#f5f8fc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'fixed', inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${primary}18 0%, transparent 60%)`, pointerEvents: 'none' }} />
        <motion.div
          initial={{ opacity: 0, filter: 'blur(16px)', y: 20 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 0.85, ease: E }}
          style={{ textAlign: 'center', maxWidth: 480, position: 'relative', zIndex: 1 }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, filter: 'blur(8px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            transition={{ delay: 0.25, duration: 0.7, ease: E }}
            style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${primary}, ${accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 36px', boxShadow: `0 8px 32px ${primary}35` }}
          >
            <span style={{ color: '#fff', fontSize: '28px', fontWeight: 400 }}>✓</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, filter: 'blur(10px)', y: 12 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ delay: 0.45, duration: 0.65, ease: E }}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 100, fontSize: 'clamp(44px, 7vw, 72px)', color: 'var(--text)', lineHeight: 1.0, letterSpacing: '-0.025em', marginBottom: 20 }}
          >
            {thanks?.title ?? 'Thank you.'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ delay: 0.65, duration: 0.6 }}
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
    <div style={{ background: '#f5f8fc', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Sky wash — top */}
      <div aria-hidden style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '50vh', pointerEvents: 'none', zIndex: 0, background: 'linear-gradient(180deg, rgba(184,221,242,0.35) 0%, transparent 100%)' }} />

      {/* Progress line */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, background: 'rgba(58,157,200,0.12)', zIndex: 50 }}>
        <motion.div
          style={{ height: '100%', background: `linear-gradient(90deg, ${primary}, ${accent})`, transformOrigin: 'left' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.55, ease: E }}
        />
      </div>

      {/* Top meta */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, padding: '18px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 40 }}>
        {form && (
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 400, color: 'rgba(13,26,36,0.3)', letterSpacing: '-0.01em' }}
          >
            {form.client_name ? `For ${form.client_name}` : form.title}
          </motion.span>
        )}
        {!isThanks && questions.length > 1 && (
          <span className="caps" style={{ color: 'rgba(13,26,36,0.28)', fontSize: '10px' }}>
            {index + 1} / {questions.length}
          </span>
        )}
      </div>

      {/* Question area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '80px 44px 100px', position: 'relative', zIndex: 10, minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: 680, margin: '0 auto' }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={current?.id ?? 'empty'}
              custom={dir}
              variants={slideVars}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {current && (
                <SlideContent
                  question={current}
                  answer={answers[current.id]}
                  onChange={val => setAnswers(a => ({ ...a, [current.id]: val }))}
                  onEnter={advance}
                  primary={primary}
                  accent={accent}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '24px 44px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 40, background: 'linear-gradient(0deg, rgba(245,248,252,0.95) 0%, transparent 100%)' }}>
        {!isFirst ? (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            whileHover={{ x: -2 }}
            onClick={back}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(13,26,36,0.35)', fontSize: '13px', fontFamily: 'var(--font-ui)', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 400 }}
          >
            ← Back
          </motion.button>
        ) : <div />}

        {!isThanks && (
          <motion.button
            whileHover={{ scale: canAdvance() ? 1.03 : 1, filter: canAdvance() ? 'brightness(1.08)' : 'none' }}
            whileTap={{ scale: canAdvance() ? 0.97 : 1 }}
            onClick={advance}
            disabled={!canAdvance() || submitting}
            className="btn-sky"
            style={{
              background: canAdvance() ? primary : 'rgba(13,26,36,0.08)',
              borderColor: canAdvance() ? primary : 'transparent',
              color: canAdvance() ? '#fff' : 'rgba(13,26,36,0.3)',
              boxShadow: canAdvance() ? `0 4px 20px ${primary}40` : 'none',
              transition: 'all 0.25s',
              cursor: canAdvance() && !submitting ? 'pointer' : 'not-allowed',
              padding: '12px 30px',
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
    <Suspense fallback={<div style={{ background: '#f5f8fc', minHeight: '100vh' }} />}>
      <FormInner />
    </Suspense>
  )
}

/* ── Slide Content ── */
function SlideContent({ question: q, answer, onChange, onEnter, primary, accent }: {
  question: Question; answer: unknown; onChange: (v: unknown) => void
  onEnter: () => void; primary: string; accent: string
}) {
  const filled = answer !== undefined && answer !== null && answer !== ''

  return (
    <div>
      {/* Question text */}
      <motion.h1
        initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ delay: 0.08, duration: 0.6, ease: E }}
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 'clamp(38px, 6vw, 72px)',
          color: 'var(--text)',
          lineHeight: 1.05,
          letterSpacing: '-0.025em',
          marginBottom: q.subtitle ? 14 : 0,
        }}
      >
        {q.title}
        {q.config.required && <span style={{ color: primary, fontSize: '0.45em', verticalAlign: 'super', marginLeft: 4 }}>*</span>}
      </motion.h1>

      {q.subtitle && (
        <motion.p
          initial={{ opacity: 0, filter: 'blur(6px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ delay: 0.18, duration: 0.55 }}
          style={{ color: 'var(--text-60)', fontSize: '1.05rem', lineHeight: 1.75 }}
        >
          {q.subtitle}
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0, filter: 'blur(8px)', y: 8 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ delay: 0.22, duration: 0.55, ease: E }}
      >

        {/* Short / email / phone */}
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
                width: '100%', background: 'transparent', border: 'none',
                borderBottom: `2px solid ${filled ? primary : 'rgba(13,26,36,0.15)'}`,
                color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 500,
                fontSize: 'clamp(22px, 3.5vw, 36px)', padding: '6px 0 12px',
                transition: 'border-color 0.3s', outline: 'none',
              }}
            />
            <p style={{ color: 'rgba(13,26,36,0.2)', fontSize: '11px', marginTop: 8, letterSpacing: '0.03em' }}>Press Enter ↵ to continue</p>
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
                width: '100%', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(13,26,36,0.1)',
                borderBottom: `2px solid ${filled ? primary : 'rgba(13,26,36,0.12)'}`,
                borderRadius: '6px 6px 0 0',
                color: 'var(--text)', fontFamily: 'var(--font-display)', fontWeight: 500,
                fontSize: 'clamp(18px, 2.5vw, 26px)', padding: '16px 18px',
                transition: 'border-color 0.3s', outline: 'none', resize: 'none', lineHeight: 1.65,
                boxShadow: 'var(--shadow-sm)',
              }}
            />
          </div>
        )}

        {/* Yes / No */}
        {q.type === 'yes_no' && (
          <div style={{ display: 'flex', gap: 12, marginTop: 44 }}>
            {['Yes', 'No'].map(opt => (
              <button
                key={opt}
                onClick={() => onChange(opt)}
                style={{
                  flex: 1, padding: '20px 24px',
                  background: answer === opt ? primary : 'rgba(255,255,255,0.8)',
                  border: `1.5px solid ${answer === opt ? primary : 'rgba(13,26,36,0.12)'}`,
                  borderRadius: 8,
                  color: answer === opt ? '#fff' : 'var(--text-60)',
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(18px, 2.5vw, 24px)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.22s',
                  boxShadow: answer === opt ? `0 6px 24px ${primary}35` : 'var(--shadow-sm)',
                }}
                onMouseEnter={e => { if (answer !== opt) { (e.currentTarget as HTMLButtonElement).style.borderColor = `${primary}60`; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)' } }}
                onMouseLeave={e => { if (answer !== opt) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(13,26,36,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-60)' } }}
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
                  initial={{ opacity: 0, filter: 'blur(6px)', x: -14 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
                  transition={{ delay: 0.05 + i * 0.07, duration: 0.4, ease: E }}
                  onClick={() => onChange(opt)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                    background: isSel ? `rgba(255,255,255,1)` : 'rgba(255,255,255,0.65)',
                    border: `1.5px solid ${isSel ? primary : 'rgba(13,26,36,0.1)'}`,
                    borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', width: '100%',
                    boxShadow: isSel ? `0 4px 16px ${primary}22` : 'var(--shadow-sm)',
                  }}
                  onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLButtonElement).style.borderColor = `${primary}55` }}
                  onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(13,26,36,0.1)' }}
                >
                  {/* Circle indicator */}
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${isSel ? primary : 'rgba(13,26,36,0.2)'}`, background: isSel ? primary : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    {isSel && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: '#fff', fontSize: '11px' }}>✓</motion.span>}
                  </div>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px, 2.2vw, 22px)', fontWeight: 500, color: isSel ? 'var(--text)' : 'var(--text-60)', transition: 'color 0.2s', flex: 1 }}>
                    {opt}
                  </span>
                  <span className="caps" style={{ color: isSel ? primary : 'rgba(13,26,36,0.18)', fontSize: '10px', flexShrink: 0 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
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
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => onChange(val)}
                  style={{
                    width: 54, height: 54, borderRadius: 8, cursor: 'pointer', transition: 'all 0.18s',
                    background: isActive ? primary : 'rgba(255,255,255,0.9)',
                    border: `1.5px solid ${isActive ? primary : 'rgba(13,26,36,0.12)'}`,
                    color: isActive ? '#fff' : 'var(--text-60)',
                    fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: isActive ? 400 : 300,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isActive ? `0 4px 16px ${primary}35` : 'var(--shadow-sm)',
                  }}
                >
                  {val}
                </motion.button>
              )
            })}
          </div>
        )}

        {/* Welcome */}
        {q.type === 'welcome' && (
          <motion.div
            initial={{ opacity: 0, filter: 'blur(8px)', y: 10 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ delay: 0.35, duration: 0.6, ease: E }}
            style={{ marginTop: 52 }}
          >
            <button
              onClick={onEnter}
              className="btn-sky"
              style={{ padding: '14px 38px', fontSize: '14px', boxShadow: `0 6px 28px ${primary}40` }}
              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.08)')}
              onMouseLeave={e => (e.currentTarget.style.filter = '')}
            >
              Begin →
            </button>
          </motion.div>
        )}

      </motion.div>
    </div>
  )
}
