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

  const [form, setForm] = useState<Form | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [responses, setResponses] = useState<Response[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
      {loading && <div className="anim-spin" style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--border)', borderTopColor: 'var(--gold)' }} />}
    </div>
  )

  const answerQs = questions.filter(q => q.type !== 'welcome' && q.type !== 'thank_you')

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 40px' }}>
        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center justify-between"
          style={{ paddingTop: 36, paddingBottom: 36, borderBottom: '1px solid var(--border-sub)' }}
        >
          <div className="flex items-center gap-8">
            <Link href={`/admin/builder?id=${id}`}>
              <span className="caps" style={{ color: 'var(--text-35)', cursor: 'pointer', fontSize: '10px' }}>← Builder</span>
            </Link>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 400 }}>
              {form?.title}
            </span>
          </div>
          <span className="caps" style={{ color: 'var(--gold)' }}>
            {responses.length} response{responses.length !== 1 ? 's' : ''}
          </span>
        </motion.nav>

        {/* Content */}
        <div style={{ paddingTop: 48, paddingBottom: '8vh' }}>
          {responses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: E }}
              style={{ textAlign: 'center', paddingTop: '12vh', paddingBottom: '12vh' }}
            >
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 300, color: 'var(--text)', marginBottom: 16 }}>
                No responses yet.
              </p>
              <p style={{ color: 'var(--text-60)', fontSize: '0.93rem', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 36px' }}>
                Share your published form link to start collecting responses from clients.
              </p>
              {form?.is_published && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 20px', border: '1px solid var(--border-sub)', borderRadius: 3 }}>
                  <span className="caps" style={{ color: 'var(--text-35)', fontSize: '10px' }}>Link</span>
                  <span style={{ color: 'var(--text-60)', fontSize: '13px' }}>
                    {typeof window !== 'undefined' ? window.location.origin : ''}/form?slug={form.slug}
                  </span>
                </div>
              )}
            </motion.div>
          ) : (
            <>
              {/* Column headers */}
              <div className="flex items-center gap-6" style={{ paddingBottom: 12, borderBottom: '1px solid var(--border-sub)', marginBottom: 0 }}>
                <span className="caps" style={{ color: 'var(--text-35)', fontSize: '10px', width: 28 }}>#</span>
                <span className="caps" style={{ color: 'var(--text-35)', fontSize: '10px', flex: 1 }}>Submitted</span>
                <span className="caps" style={{ color: 'var(--text-35)', fontSize: '10px' }}>Answers</span>
              </div>

              {responses.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.45, ease: E }}
                  style={{ borderBottom: '1px solid var(--border-sub)' }}
                >
                  <button
                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                    className="flex items-center gap-6"
                    style={{ width: '100%', padding: '18px 0', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--text-35)', width: 28, flexShrink: 0 }}>
                      {responses.length - i}
                    </span>
                    <span style={{ color: 'var(--text-60)', fontSize: '13px', flex: 1 }}>{fmt(r.submitted_at)}</span>
                    <span style={{ color: 'var(--text-35)', fontSize: '11px', letterSpacing: '0.04em' }}>
                      {Object.keys(r.answers as object).length} answers
                    </span>
                    <span style={{ color: 'var(--text-35)', fontSize: '14px', width: 20, textAlign: 'center', transform: expanded === r.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.22s' }}>
                      ∨
                    </span>
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
                        <div style={{ paddingLeft: 34, paddingBottom: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                          <div className="rule-gold" style={{ marginBottom: 4 }} />
                          {answerQs.map(q => {
                            const ans = (r.answers as Record<string, unknown>)[q.id]
                            if (ans == null) return null
                            return (
                              <div key={q.id}>
                                <p className="caps" style={{ color: 'var(--text-35)', fontSize: '10px', marginBottom: 6 }}>{q.title}</p>
                                <p style={{ color: 'var(--text)', fontSize: '15px', lineHeight: 1.55, fontFamily: q.type === 'long_text' ? 'var(--font-display)' : 'var(--font-ui)', fontWeight: q.type === 'long_text' ? 300 : 400 }}>
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
