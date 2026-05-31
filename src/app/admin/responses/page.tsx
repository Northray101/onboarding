'use client'

export const dynamic = 'force-static'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { supabase, type Form, type Question, type Response } from '@/lib/supabase'

const E = [0.16, 1, 0.3, 1] as [number, number, number, number]

function fmt(d: string) {
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function ResponsesInner() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const [form, setForm]         = useState<Form | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [responses, setResponses] = useState<Response[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!id) return
    async function load() {
      const [{ data: f }, { data: q }, { data: r }] = await Promise.all([
        supabase.from('forms').select('*').eq('id', id!).single(),
        supabase.from('questions').select('*').eq('form_id', id!).order('position'),
        supabase.from('responses').select('*').eq('form_id', id!).order('submitted_at', { ascending: false }),
      ])
      setForm(f); setQuestions(q ?? []); setResponses(r ?? []); setLoading(false)
    }
    load()
  }, [id])

  if (!id || loading) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {loading && <div className="anim-spin" style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--sky-light)', borderTopColor: 'var(--sky)' }} />}
    </div>
  )

  const answerQs = questions.filter(q => q.type !== 'welcome' && q.type !== 'thank_you')

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div aria-hidden style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '35vh', pointerEvents: 'none', zIndex: 0, background: 'linear-gradient(180deg, rgba(184,221,242,0.22) 0%, transparent 100%)' }} />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 44px', position: 'relative', zIndex: 1 }}>
        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0, filter: 'blur(8px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, ease: E }}
          className="flex items-center justify-between"
          style={{ paddingTop: 32, paddingBottom: 32, borderBottom: '1px solid var(--border-sub)' }}
        >
          <div className="flex items-center gap-6">
            <Link href={`/admin/builder?id=${id}`}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 400, color: 'var(--sky-deep)', cursor: 'pointer' }}>← Builder</span>
            </Link>
            <div style={{ width: 1, height: 16, background: 'var(--border-sub)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '22px', color: 'var(--text)', letterSpacing: '-0.01em' }}>
              {form?.title}
            </span>
          </div>
          <span className="caps" style={{ color: 'var(--sky)', background: 'var(--sky-dim)', padding: '4px 12px', borderRadius: 100, fontSize: '10px' }}>
            {responses.length} response{responses.length !== 1 ? 's' : ''}
          </span>
        </motion.nav>

        <div style={{ paddingTop: 44, paddingBottom: '8vh' }}>
          {responses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, filter: 'blur(10px)', y: 14 }} animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ duration: 0.6, ease: E }}
              style={{ textAlign: 'center', paddingTop: '12vh', paddingBottom: '12vh' }}
            >
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-tint)', border: '1px solid var(--border)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--sky)' }}>✉</span>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(32px, 4.5vw, 48px)', color: 'var(--text)', marginBottom: 12, letterSpacing: '-0.02em' }}>No responses yet.</p>
              <p style={{ color: 'var(--text-60)', maxWidth: 360, margin: '0 auto 28px', lineHeight: 1.7, fontSize: '0.93rem' }}>
                Share your published form link to start collecting responses.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Header row */}
              <div className="flex items-center gap-6" style={{ paddingBottom: 12, borderBottom: '1px solid var(--border-sub)' }}>
                <span className="caps" style={{ color: 'var(--text-35)', fontSize: '10px', width: 28 }}>#</span>
                <span className="caps" style={{ color: 'var(--text-35)', fontSize: '10px', flex: 1 }}>Submitted</span>
                <span className="caps" style={{ color: 'var(--text-35)', fontSize: '10px' }}>Questions answered</span>
              </div>

              {responses.map((r, i) => (
                <motion.div key={r.id}
                  initial={{ opacity: 0, filter: 'blur(6px)', y: 8 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.45, ease: E }}
                  style={{ borderBottom: '1px solid var(--border-sub)' }}
                >
                  <button onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                    style={{ width: '100%', padding: '18px 0', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 24 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 400, color: 'var(--sky)', width: 28, flexShrink: 0 }}>{responses.length - i}</span>
                    <span style={{ color: 'var(--text-60)', fontSize: '13px', flex: 1, textAlign: 'left' }}>{fmt(r.submitted_at)}</span>
                    <span style={{ color: 'var(--text-35)', fontSize: '12px' }}>{Object.keys(r.answers as object).length} / {answerQs.length}</span>
                    <span style={{ color: 'var(--sky)', fontSize: '12px', width: 18, textAlign: 'center', transition: 'transform 0.2s', transform: expanded === r.id ? 'rotate(180deg)' : 'none' }}>▾</span>
                  </button>

                  <AnimatePresence>
                    {expanded === r.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: E }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="card" style={{ margin: '0 0 20px', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                          {answerQs.map(q => {
                            const ans = (r.answers as Record<string, unknown>)[q.id]
                            if (ans == null) return null
                            return (
                              <div key={q.id}>
                                <p className="caps" style={{ color: 'var(--sky)', fontSize: '10px', marginBottom: 6 }}>{q.title}</p>
                                <p style={{ color: 'var(--text)', fontSize: '15px', lineHeight: 1.6, fontFamily: q.type === 'long_text' ? 'var(--font-display)' : 'var(--font-ui)', fontWeight: q.type === 'long_text' ? 300 : 400 }}>
                                  {String(ans)}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResponsesPage() {
  return (
    <Suspense fallback={<div style={{ background: 'var(--bg)', minHeight: '100vh' }} />}>
      <ResponsesInner />
    </Suspense>
  )
}
