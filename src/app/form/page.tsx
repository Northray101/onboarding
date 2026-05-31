'use client'

export const dynamic = 'force-static'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, type Form, type Question } from '@/lib/supabase'
import { Star, ChevronRight, ChevronLeft, Check } from 'lucide-react'

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '60%' : '-60%', opacity: 0, scale: 0.95 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0, scale: 0.95 }),
}

function FormInner() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug')

  const [form, setForm] = useState<Form | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!slug) { setError('No form specified.'); setLoading(false); return }
    async function load() {
      const { data: f } = await supabase.from('forms').select('*').eq('slug', slug!).eq('is_published', true).single()
      if (!f) { setError('Form not found or not published.'); setLoading(false); return }
      setForm(f)
      const { data: q } = await supabase.from('questions').select('*').eq('form_id', f.id).order('position')
      setQuestions(q ?? [])
      setLoading(false)
    }
    load()
  }, [slug])

  const current = questions[index]
  const isFirst = index === 0
  const isLast = index === questions.length - 1
  const isThankYou = current?.type === 'thank_you'
  const progress = questions.length > 0 ? (index / Math.max(questions.length - 1, 1)) * 100 : 0

  function canAdvance() {
    if (!current) return false
    if (current.type === 'welcome' || current.type === 'thank_you') return true
    if (!current.config.required) return true
    const ans = answers[current.id]
    return ans !== undefined && ans !== null && ans !== ''
  }

  async function advance() {
    if (!canAdvance()) return
    if (isLast || isThankYou) { await submit(); return }
    setDir(1)
    setIndex(i => i + 1)
  }

  function back() {
    if (isFirst) return
    setDir(-1)
    setIndex(i => i - 1)
  }

  async function submit() {
    setSubmitting(true)
    await supabase.from('responses').insert({ form_id: form!.id, answers })
    setSubmitted(true)
    setSubmitting(false)
  }

  const primary = form?.theme?.primary ?? '#6366f1'
  const accent = form?.theme?.accent ?? '#ec4899'
  const bg = form?.theme?.bg ?? '#0b0b14'

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0b14' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 rounded-full border-2 border-t-transparent"
        style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }} />
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0b14' }}>
      <div className="text-center">
        <p className="text-2xl font-bold text-white mb-2">Oops</p>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>{error}</p>
      </div>
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden" style={{ background: bg }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: `radial-gradient(circle, ${primary}, transparent)` }} />
      </div>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.8 }} className="text-center max-w-md relative z-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>
          <Check size={40} className="text-white" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="text-4xl font-bold text-white mb-4">
          {questions.find(q => q.type === 'thank_you')?.title ?? 'All done!'}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ color: 'rgba(255,255,255,0.55)' }}>
          {questions.find(q => q.type === 'thank_you')?.subtitle ?? "Your responses have been recorded. We'll be in touch soon."}
        </motion.p>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: bg }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: `radial-gradient(circle, ${primary}, transparent)`, top: '-10%', left: '-10%' }} />
        <motion.div animate={{ x: [0, -25, 0], y: [0, 25, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: `radial-gradient(circle, ${accent}, transparent)`, bottom: '-10%', right: '-10%' }} />
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div className="h-full" style={{ background: `linear-gradient(90deg, ${primary}, ${accent})` }}
          animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: 'easeInOut' }} />
      </div>

      {!isThankYou && (
        <div className="fixed top-4 right-6 z-40">
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{index + 1} / {questions.length}</span>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-6 py-20 relative z-10">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={current?.id ?? 'empty'} custom={dir} variants={slideVariants}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}>
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

      <div className="fixed bottom-8 left-0 right-0 flex items-center justify-center gap-4 z-40">
        {!isFirst && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={back} className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}>
            <ChevronLeft size={16} /> Back
          </motion.button>
        )}
        {!isThankYou && (
          <motion.button
            whileHover={{ scale: canAdvance() ? 1.05 : 1 }} whileTap={{ scale: canAdvance() ? 0.96 : 1 }}
            onClick={advance} disabled={!canAdvance() || submitting}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-semibold text-white"
            style={{
              background: canAdvance() ? `linear-gradient(135deg, ${primary}, ${accent})` : 'rgba(255,255,255,0.1)',
              color: canAdvance() ? 'white' : 'rgba(255,255,255,0.3)',
              boxShadow: canAdvance() ? `0 0 30px ${primary}50` : 'none',
              transition: 'all 0.3s',
            }}>
            {submitting ? 'Submitting…' : isLast ? 'Submit' : <>Continue <ChevronRight size={16} /></>}
          </motion.button>
        )}
      </div>
    </div>
  )
}

export default function FormPage() {
  return <Suspense fallback={<div className="min-h-screen" style={{ background: '#0b0b14' }} />}><FormInner /></Suspense>
}

function SlideContent({ question: q, answer, onChange, onEnter, primary, accent }: {
  question: Question; answer: unknown; onChange: (v: unknown) => void
  onEnter: () => void; primary: string; accent: string
}) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold text-white leading-tight">
          {q.title}{q.config.required && <span style={{ color: primary }}> *</span>}
        </motion.h1>
        {q.subtitle && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="mt-4 text-xl" style={{ color: 'rgba(255,255,255,0.55)' }}>{q.subtitle}</motion.p>
        )}
      </div>

      {(q.type === 'short_text' || q.type === 'email' || q.type === 'phone') && (
        <motion.input initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          autoFocus type={q.type === 'email' ? 'email' : q.type === 'phone' ? 'tel' : 'text'}
          value={(answer as string) ?? ''} onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onEnter()}
          placeholder={q.config.placeholder ?? 'Type your answer…'}
          className="w-full text-xl text-white border-b-2 pb-3 bg-transparent placeholder:opacity-30 focus:outline-none"
          style={{ borderColor: answer ? primary : 'rgba(255,255,255,0.2)', transition: 'border-color 0.3s' }} />
      )}

      {q.type === 'long_text' && (
        <motion.textarea initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          autoFocus value={(answer as string) ?? ''} onChange={e => onChange(e.target.value)}
          placeholder={q.config.placeholder ?? 'Your answer…'} rows={5}
          className="w-full text-lg text-white rounded-2xl p-5 resize-none focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: `2px solid ${answer ? primary : 'rgba(255,255,255,0.1)'}`, transition: 'border-color 0.3s' }} />
      )}

      {q.type === 'yes_no' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="flex gap-4">
          {['Yes', 'No'].map(opt => (
            <motion.button key={opt} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => onChange(opt)}
              className="flex-1 py-5 rounded-2xl text-xl font-semibold transition-all"
              style={{
                background: answer === opt ? `linear-gradient(135deg, ${primary}, ${accent})` : 'rgba(255,255,255,0.06)',
                color: answer === opt ? 'white' : 'rgba(255,255,255,0.6)',
                border: `2px solid ${answer === opt ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                boxShadow: answer === opt ? `0 0 30px ${primary}40` : 'none',
              }}>{opt}</motion.button>
          ))}
        </motion.div>
      )}

      {q.type === 'multiple_choice' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="flex flex-col gap-3">
          {(q.config.options ?? []).map((opt, i) => {
            const isSelected = answer === opt
            return (
              <motion.button key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
                whileHover={{ x: 4 }} whileTap={{ scale: 0.99 }} onClick={() => onChange(opt)}
                className="flex items-center gap-4 w-full text-left px-5 py-4 rounded-2xl transition-all"
                style={{ background: isSelected ? `${primary}20` : 'rgba(255,255,255,0.04)', border: `2px solid ${isSelected ? primary : 'rgba(255,255,255,0.08)'}` }}>
                <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{ borderColor: isSelected ? primary : 'rgba(255,255,255,0.2)', background: isSelected ? primary : 'transparent' }}>
                  {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 rounded-full bg-white" />}
                </div>
                <span className="text-lg" style={{ color: isSelected ? 'white' : 'rgba(255,255,255,0.7)' }}>{opt}</span>
                <span className="ml-auto text-sm font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>{String.fromCharCode(65 + i)}</span>
              </motion.button>
            )
          })}
        </motion.div>
      )}

      {q.type === 'rating' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="flex gap-3">
          {[...Array(q.config.max_rating ?? 5)].map((_, i) => {
            const val = i + 1
            const isActive = (answer as number) >= val
            return (
              <motion.button key={i} whileHover={{ scale: 1.2, rotate: 10 }} whileTap={{ scale: 0.9 }} onClick={() => onChange(val)}>
                <Star size={44} fill={isActive ? primary : 'none'}
                  style={{ color: isActive ? primary : 'rgba(255,255,255,0.2)', filter: isActive ? `drop-shadow(0 0 8px ${primary})` : 'none' }} />
              </motion.button>
            )
          })}
        </motion.div>
      )}

      {q.type === 'welcome' && (
        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={onEnter}
          className="self-start flex items-center gap-2 px-8 py-4 rounded-2xl text-lg font-semibold text-white"
          style={{ background: `linear-gradient(135deg, ${primary}, ${accent})`, boxShadow: `0 0 40px ${primary}50` }}>
          Get Started <ChevronRight size={20} />
        </motion.button>
      )}
    </div>
  )
}
