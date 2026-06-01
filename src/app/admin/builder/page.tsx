'use client'

export const dynamic = 'force-static'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import Link from 'next/link'
import { supabase, type Form, type Question, type QuestionType } from '@/lib/supabase'

const E = [0.16, 1, 0.3, 1] as [number, number, number, number]

const TYPE_META: Record<QuestionType, { label: string; glyph: string }> = {
  welcome:         { label: 'Welcome',        glyph: '★' },
  short_text:      { label: 'Short Text',      glyph: 'T' },
  long_text:       { label: 'Long Text',       glyph: '¶' },
  yes_no:          { label: 'Yes / No',        glyph: '?' },
  multiple_choice: { label: 'Multiple Choice', glyph: '≡' },
  rating:          { label: 'Rating',          glyph: '◇' },
  email:           { label: 'Email',           glyph: '@' },
  phone:           { label: 'Phone',           glyph: '℡' },
  thank_you:       { label: 'Thank You',       glyph: '✓' },
}

const ALL_TYPES = Object.keys(TYPE_META) as QuestionType[]

function BuilderInner() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const [form, setForm]         = useState<Form | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => { if (id) loadData() }, [id])

  async function loadData() {
    const [{ data: f }, { data: q }] = await Promise.all([
      supabase.from('forms').select('*').eq('id', id!).single(),
      supabase.from('questions').select('*').eq('form_id', id!).order('position'),
    ])
    setForm(f); setQuestions(q ?? []); setLoading(false)
  }

  async function addQuestion(type: QuestionType) {
    setShowMenu(false)
    const defaults = {
      form_id: id!,
      position: questions.length,
      type,
      title: type === 'welcome' ? 'Welcome.' : type === 'thank_you' ? 'Thank you.' : 'Your question here',
      subtitle: type === 'welcome' ? "We're excited to work with you." : null,
      config: type === 'multiple_choice' ? { options: ['Option A', 'Option B', 'Option C'] }
        : type === 'rating' ? { max_rating: 5 }
        : { placeholder: '', required: false },
    }
    const { data } = await supabase.from('questions').insert(defaults).select().single()
    if (data) { setQuestions(q => [...q, data as Question]); setSelected(data.id) }
  }

  function patchQuestion(q: Question) {
    setQuestions(qs => qs.map(x => x.id === q.id ? q : x))
  }

  async function saveQuestion(q: Question) {
    setSaving(true)
    await supabase.from('questions').update({ title: q.title, subtitle: q.subtitle, config: q.config }).eq('id', q.id)
    setSaving(false)
  }

  async function deleteQuestion(qid: string) {
    await supabase.from('questions').delete().eq('id', qid)
    setQuestions(qs => qs.filter(x => x.id !== qid))
    if (selected === qid) setSelected(null)
  }

  async function reorder(newOrder: Question[]) {
    setQuestions(newOrder)
    await Promise.all(newOrder.map((q, i) => supabase.from('questions').update({ position: i }).eq('id', q.id)))
  }

  async function togglePublish() {
    if (!form) return
    const next = !form.is_published
    await supabase.from('forms').update({ is_published: next }).eq('id', id!)
    setForm(f => f ? { ...f, is_published: next } : f)
  }

  const selectedQ    = questions.find(q => q.id === selected)
  const accentColor  = form?.theme?.primary ?? 'var(--sky)'

  if (!id) return <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--text-35)' }}>No form ID.</p></div>

  if (loading) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="anim-spin" style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--sky-light)', borderTopColor: 'var(--sky)' }} />
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Top bar */}
      <div style={{ borderBottom: '1px solid var(--border-sub)', background: 'rgba(245,248,252,0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 20, boxShadow: '0 1px 0 var(--border-sub)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/admin">
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 400, color: 'var(--sky-deep)', cursor: 'pointer' }}>← Dashboard</span>
          </Link>
          <div style={{ width: 1, height: 14, background: 'var(--border-sub)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 400, color: 'var(--text)', letterSpacing: '-0.01em' }}>{form?.title}</span>
          {form?.client_name && <span style={{ color: 'var(--text-35)', fontSize: '12px' }}>— {form.client_name}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {saving && <span className="caps" style={{ color: 'var(--text-35)', fontSize: '10px' }}>Saving…</span>}
          {form?.is_published && (
            <Link href={`/form?slug=${form.slug}`} target="_blank">
              <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: '12px' }}>Preview ↗</button>
            </Link>
          )}
          <Link href={`/admin/responses?id=${id}`}>
            <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: '12px' }}>Responses</button>
          </Link>
          <button className="btn-sky" onClick={togglePublish}
            style={{ padding: '7px 16px', fontSize: '12px', background: form?.is_published ? 'transparent' : 'var(--sky)', color: form?.is_published ? 'rgba(190,60,60,0.8)' : '#fff', borderColor: form?.is_published ? 'rgba(220,80,80,0.25)' : 'var(--sky)' }}>
            {form?.is_published ? 'Unpublish' : 'Publish →'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left: Slides list */}
        <div style={{ width: 232, flexShrink: 0, borderRight: '1px solid var(--border-sub)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 12px 10px', borderBottom: '1px solid var(--border-sub)', position: 'relative' }}>
            <p className="caps" style={{ color: 'var(--text-35)', fontSize: '10px', marginBottom: 8 }}>Slides ({questions.length})</p>
            <button className="btn-ghost"
              onClick={() => setShowMenu(!showMenu)}
              style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '8px', borderStyle: 'dashed', color: 'var(--sky)', borderColor: 'var(--sky-dim)' }}>
              + Add Slide
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, filter: 'blur(6px)', y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
                  exit={{ opacity: 0, filter: 'blur(4px)', y: -6, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: E }}
                  style={{ position: 'absolute', top: '100%', left: 10, right: 10, zIndex: 30, background: 'var(--bg-card)', border: '1px solid var(--border-sub)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}
                >
                  {ALL_TYPES.map(type => (
                    <button key={type} onClick={() => addQuestion(type)}
                      style={{ width: '100%', padding: '9px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.14s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-tint)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--sky)', width: 16, textAlign: 'center', flexShrink: 0 }}>
                        {TYPE_META[type].glyph}
                      </span>
                      <span style={{ color: 'var(--text-60)', fontSize: '12px' }}>{TYPE_META[type].label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {questions.length === 0 ? (
              <p style={{ color: 'var(--text-35)', fontSize: '11px', textAlign: 'center', padding: '28px 12px', lineHeight: 1.7 }}>
                No slides yet.<br />Add one above.
              </p>
            ) : (
              <Reorder.Group axis="y" values={questions} onReorder={reorder} style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {questions.map((q, i) => {
                  const isSel = selected === q.id
                  return (
                    <Reorder.Item key={q.id} value={q} style={{ listStyle: 'none' }}>
                      <div onClick={() => setSelected(q.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', background: isSel ? 'var(--bg-tint)' : 'transparent', border: `1px solid ${isSel ? 'var(--sky-dim)' : 'transparent'}`, transition: 'all 0.16s' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '10px', color: 'var(--text-35)', width: 14, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: isSel ? 'var(--sky)' : 'var(--text-35)', width: 13, flexShrink: 0, textAlign: 'center' }}>{TYPE_META[q.type].glyph}</span>
                        <span style={{ fontSize: '12px', color: isSel ? 'var(--sky-deep)' : 'var(--text-60)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, fontWeight: isSel ? 500 : 400 }}>{q.title}</span>
                      </div>
                    </Reorder.Item>
                  )
                })}
              </Reorder.Group>
            )}
          </div>
        </div>

        {/* Center: Preview canvas */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 32, position: 'relative', background: 'var(--bg)' }}>
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 40% 35%, ${accentColor}10 0%, transparent 60%)`, pointerEvents: 'none' }} />
          {selectedQ ? (
            <SlidePreview question={selectedQ} theme={form?.theme} />
          ) : (
            <div style={{ textAlign: 'center', opacity: 0.45 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '28px', color: 'var(--text)', marginBottom: 6 }}>Select a slide</p>
              <p style={{ color: 'var(--text-35)', fontSize: '13px' }}>or add one from the left panel</p>
            </div>
          )}
        </div>

        {/* Right: Editor */}
        <AnimatePresence>
          {selectedQ && (
            <motion.div
              initial={{ opacity: 0, filter: 'blur(8px)', x: 14 }}
              animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
              exit={{ opacity: 0, filter: 'blur(4px)', x: 14 }}
              transition={{ duration: 0.3, ease: E }}
              style={{ width: 272, flexShrink: 0, borderLeft: '1px solid var(--border-sub)', background: 'var(--bg-card)', overflowY: 'auto' }}>
              <QuestionEditor question={selectedQ} onPatch={patchQuestion} onSave={saveQuestion} onDelete={deleteQuestion} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div style={{ background: 'var(--bg)', minHeight: '100vh' }} />}>
      <BuilderInner />
    </Suspense>
  )
}

/* ── Slide Preview ── */
function SlidePreview({ question: q, theme }: { question: Question; theme?: Form['theme'] }) {
  const primary = theme?.primary ?? '#3a9dc8'
  const accent  = theme?.accent  ?? '#89c1da'

  return (
    <motion.div key={q.id}
      initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.97 }}
      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
      transition={{ duration: 0.4, ease: E }}
      className="card"
      style={{ width: '100%', maxWidth: 520, padding: '44px 48px', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}
    >
      {/* Top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${primary}, ${accent})` }} />

      <p className="caps" style={{ color: 'var(--text-35)', marginBottom: 24, fontSize: '10px' }}>{TYPE_META[q.type].label}</p>

      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(24px, 3vw, 34px)', color: 'var(--text)', lineHeight: 1.15, marginBottom: q.subtitle ? 10 : 24, letterSpacing: '-0.015em' }}>
        {q.title}
        {q.config.required && <span style={{ color: primary }}> *</span>}
      </h2>

      {q.subtitle && <p style={{ color: 'var(--text-60)', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: 24 }}>{q.subtitle}</p>}

      {(q.type === 'short_text' || q.type === 'email' || q.type === 'phone') && (
        <div style={{ borderBottom: `1.5px solid ${primary}50`, paddingBottom: 8, marginBottom: 24 }}>
          <p style={{ color: 'var(--text-35)', fontSize: '0.9rem' }}>{q.config.placeholder || 'Type your answer…'}</p>
        </div>
      )}
      {q.type === 'long_text' && (
        <div style={{ border: `1px solid ${primary}30`, borderRadius: 4, padding: '12px 14px', marginBottom: 24, minHeight: 72, background: 'rgba(255,255,255,0.5)' }}>
          <p style={{ color: 'var(--text-35)', fontSize: '0.85rem' }}>{q.config.placeholder || 'Your answer…'}</p>
        </div>
      )}
      {q.type === 'yes_no' && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {['Yes', 'No'].map(o => (
            <div key={o} style={{ flex: 1, padding: '11px', border: `1px solid ${primary}30`, borderRadius: 4, textAlign: 'center', color: 'var(--text-60)', fontSize: '0.9rem', background: 'rgba(255,255,255,0.6)' }}>{o}</div>
          ))}
        </div>
      )}
      {q.type === 'multiple_choice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 24 }}>
          {(q.config.options ?? []).map((o, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', border: `1px solid ${primary}25`, borderRadius: 4, background: 'rgba(255,255,255,0.6)' }}>
              <div style={{ width: 15, height: 15, borderRadius: '50%', border: `1.5px solid ${primary}60`, flexShrink: 0 }} />
              <span style={{ color: 'var(--text-60)', fontSize: '0.85rem' }}>{o}</span>
            </div>
          ))}
        </div>
      )}
      {q.type === 'rating' && (
        <div style={{ display: 'flex', gap: 7, marginBottom: 24 }}>
          {[...Array(q.config.max_rating ?? 5)].map((_, i) => (
            <div key={i} style={{ width: 32, height: 32, border: `1px solid ${primary}35`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--text-35)' }}>{i + 1}</span>
            </div>
          ))}
        </div>
      )}

      {q.type !== 'thank_you' && (
        <button style={{ padding: '9px 20px', background: primary, border: 'none', color: '#fff', fontSize: '12px', borderRadius: 4, cursor: 'default', fontFamily: 'var(--font-ui)', fontWeight: 500 }}>
          {q.type === 'welcome' ? 'Begin →' : 'Continue →'}
        </button>
      )}
    </motion.div>
  )
}

/* ── Question Editor ── */
function QuestionEditor({ question, onPatch, onSave, onDelete }: {
  question: Question; onPatch: (q: Question) => void; onSave: (q: Question) => void; onDelete: (id: string) => void
}) {
  const [q, setQ] = useState(question)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setQ(question) }, [question.id])

  function update(patch: Partial<Question>) {
    const updated = { ...q, ...patch }
    setQ(updated)
    onPatch(updated)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => onSave(updated), 600)
  }
  function cfg(patch: Partial<Question['config']>) {
    update({ config: { ...q.config, ...patch } })
  }

  return (
    <div style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid var(--border-sub)' }}>
        <p className="caps" style={{ color: 'var(--sky)', fontSize: '10px' }}>{TYPE_META[q.type].label}</p>
        <button className="btn-danger" style={{ padding: '4px 10px', fontSize: '10px' }} onClick={() => onDelete(q.id)}>Delete</button>
      </div>

      <Field label="Title">
        <textarea className="input-box" value={q.title} onChange={e => update({ title: e.target.value })} rows={2} style={{ resize: 'none' }} />
      </Field>
      <Field label="Subtitle">
        <textarea className="input-box" value={q.subtitle ?? ''} onChange={e => update({ subtitle: e.target.value || null })} rows={2} style={{ resize: 'none' }} />
      </Field>

      {(q.type === 'short_text' || q.type === 'long_text' || q.type === 'email' || q.type === 'phone') && (
        <Field label="Placeholder">
          <input className="input-box" value={q.config.placeholder ?? ''} onChange={e => cfg({ placeholder: e.target.value })} />
        </Field>
      )}

      {q.type === 'multiple_choice' && (
        <div>
          <p className="caps" style={{ color: 'var(--text-35)', marginBottom: 9, fontSize: '10px' }}>Options</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(q.config.options ?? []).map((o, i) => (
              <div key={i} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <input className="input-box" style={{ flex: 1 }} value={o} onChange={e => { const opts = [...(q.config.options ?? [])]; opts[i] = e.target.value; cfg({ options: opts }) }} />
                <button style={{ padding: '5px 8px', background: 'transparent', border: '1px solid rgba(220,80,80,0.2)', borderRadius: 3, color: 'rgba(190,60,60,0.6)', fontSize: '11px', cursor: 'pointer' }} onClick={() => cfg({ options: q.config.options?.filter((_, idx) => idx !== i) })}>×</button>
              </div>
            ))}
            <button style={{ padding: '7px', background: 'var(--bg)', border: '1px dashed var(--border-sub)', borderRadius: 4, color: 'var(--sky)', fontSize: '11px', cursor: 'pointer', marginTop: 2 }} onClick={() => cfg({ options: [...(q.config.options ?? []), `Option ${(q.config.options?.length ?? 0) + 1}`] })}>
              + Add option
            </button>
          </div>
        </div>
      )}

      {q.type === 'rating' && (
        <Field label="Max stars">
          <select className="input-box" value={q.config.max_rating ?? 5} onChange={e => cfg({ max_rating: +e.target.value })}>
            {[3, 5, 7, 10].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>
      )}

      {q.type !== 'welcome' && q.type !== 'thank_you' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => cfg({ required: !q.config.required })}
            style={{ width: 34, height: 18, borderRadius: 9, border: 'none', cursor: 'pointer', background: q.config.required ? 'var(--sky)' : 'var(--border-sub)', transition: 'background 0.2s', position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', left: q.config.required ? 18 : 2, boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
          </button>
          <span style={{ fontSize: '12px', color: 'var(--text-60)' }}>Required</span>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="caps" style={{ color: 'var(--text-35)', marginBottom: 7, fontSize: '10px' }}>{label}</p>
      {children}
    </div>
  )
}
