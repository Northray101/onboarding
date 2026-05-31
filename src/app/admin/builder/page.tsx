'use client'

export const dynamic = 'force-static'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import Link from 'next/link'
import { supabase, type Form, type Question, type QuestionType } from '@/lib/supabase'

const E = [0.16, 1, 0.3, 1] as [number, number, number, number]

const TYPE_META: Record<QuestionType, { label: string; roman: string }> = {
  welcome:         { label: 'Welcome',         roman: 'W' },
  short_text:      { label: 'Short Text',       roman: 'T' },
  long_text:       { label: 'Long Text',        roman: 'L' },
  yes_no:          { label: 'Yes / No',         roman: 'Y' },
  multiple_choice: { label: 'Multiple Choice',  roman: 'M' },
  rating:          { label: 'Rating',           roman: 'R' },
  email:           { label: 'Email',            roman: 'E' },
  phone:           { label: 'Phone',            roman: 'P' },
  thank_you:       { label: 'Thank You',        roman: '✓' },
}

const ALL_TYPES = Object.keys(TYPE_META) as QuestionType[]

function BuilderInner() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const [form, setForm] = useState<Form | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  async function updateQuestion(q: Question) {
    setSaving(true)
    await supabase.from('questions').update({ title: q.title, subtitle: q.subtitle, config: q.config }).eq('id', q.id)
    setQuestions(qs => qs.map(x => x.id === q.id ? q : x))
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

  const selectedQ = questions.find(q => q.id === selected)
  const accentColor = form?.theme?.primary ?? '#c9a84c'

  if (!id) return <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: 'var(--text-35)' }}>No form ID.</p></div>

  if (loading) return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="anim-spin" style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)', borderTopColor: 'var(--gold)' }} />
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Top bar ── */}
      <div style={{ borderBottom: '1px solid var(--border-sub)', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'var(--bg)', position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/admin">
            <span className="caps" style={{ color: 'var(--text-35)', cursor: 'pointer', fontSize: '10px' }}>← Dashboard</span>
          </Link>
          <div style={{ width: 1, height: 16, background: 'var(--border-sub)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 400, color: 'var(--text)' }}>
            {form?.title}
          </span>
          {form?.client_name && (
            <span style={{ color: 'var(--text-35)', fontSize: '12px' }}>— {form.client_name}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saving && <span className="caps" style={{ color: 'var(--text-35)', fontSize: '10px' }}>Saving…</span>}
          {form?.is_published && (
            <Link href={`/form?slug=${form.slug}`} target="_blank">
              <button className="btn-ghost" style={{ fontSize: '11px', padding: '8px 16px' }}>Preview ↗</button>
            </Link>
          )}
          <Link href={`/admin/responses?id=${id}`}>
            <button className="btn-ghost" style={{ fontSize: '11px', padding: '8px 16px' }}>Responses</button>
          </Link>
          <button
            className="btn-gold"
            onClick={togglePublish}
            style={{
              fontSize: '11px', padding: '8px 18px',
              background: form?.is_published ? 'transparent' : 'var(--gold)',
              color: form?.is_published ? 'rgba(220,100,100,0.8)' : '#090909',
              borderColor: form?.is_published ? 'rgba(220,80,80,0.3)' : 'var(--gold)',
            }}
          >
            {form?.is_published ? 'Unpublish' : 'Publish →'}
          </button>
        </div>
      </div>

      {/* ── Three panels ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left: Slides ── */}
        <div style={{ width: 240, flexShrink: 0, borderRight: '1px solid var(--border-sub)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border-sub)', position: 'relative' }}>
            <p className="caps" style={{ color: 'var(--text-35)', marginBottom: 10, fontSize: '10px' }}>
              Slides ({questions.length})
            </p>
            <button
              className="btn-ghost"
              onClick={() => setShowMenu(!showMenu)}
              style={{ width: '100%', justifyContent: 'center', fontSize: '11px', padding: '9px', borderStyle: 'dashed' }}
            >
              + Add Slide
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    position: 'absolute', top: '100%', left: 12, right: 12, zIndex: 30,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                  }}
                >
                  {ALL_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => addQuestion(type)}
                      className="flex items-center gap-3"
                      style={{
                        width: '100%', padding: '10px 14px', background: 'transparent',
                        border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: 'var(--gold)', width: 14, textAlign: 'center' }}>
                        {TYPE_META[type].roman}
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
              <p style={{ color: 'var(--text-35)', fontSize: '11px', textAlign: 'center', padding: '32px 12px', lineHeight: 1.7 }}>
                No slides yet.<br />Add one above.
              </p>
            ) : (
              <Reorder.Group axis="y" values={questions} onReorder={reorder} style={{ display: 'flex', flexDirection: 'column', gap: 2, listStyle: 'none', padding: 0, margin: 0 }}>
                {questions.map((q, i) => {
                  const isSel = selected === q.id
                  return (
                    <Reorder.Item key={q.id} value={q} style={{ listStyle: 'none' }}>
                      <div
                        onClick={() => setSelected(q.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px',
                          borderRadius: 'var(--radius)', cursor: 'pointer',
                          background: isSel ? 'var(--gold-glow)' : 'transparent',
                          border: `1px solid ${isSel ? 'var(--gold-dim)' : 'transparent'}`,
                          transition: 'all 0.18s',
                        }}
                      >
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '10px', color: 'var(--text-35)', width: 14, textAlign: 'right', flexShrink: 0 }}>
                          {i + 1}
                        </span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', color: isSel ? 'var(--gold)' : 'var(--text-35)', width: 12, flexShrink: 0, textAlign: 'center' }}>
                          {TYPE_META[q.type].roman}
                        </span>
                        <span style={{ fontSize: '12px', color: isSel ? 'var(--text)' : 'var(--text-60)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {q.title}
                        </span>
                      </div>
                    </Reorder.Item>
                  )
                })}
              </Reorder.Group>
            )}
          </div>
        </div>

        {/* ── Center: Preview ── */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', padding: 32 }}>
          {/* Ambient glow from form theme */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse at center, ${accentColor}08 0%, transparent 65%)` }} />

          {selectedQ ? (
            <SlidePreview question={selectedQ} theme={form?.theme} />
          ) : (
            <div style={{ textAlign: 'center', opacity: 0.4 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 300, color: 'var(--text)', marginBottom: 8 }}>
                Select a slide
              </p>
              <p style={{ color: 'var(--text-35)', fontSize: '13px' }}>or add one from the left panel</p>
            </div>
          )}
        </div>

        {/* ── Right: Editor ── */}
        <AnimatePresence>
          {selectedQ && (
            <motion.div
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.3, ease: E }}
              style={{ width: 280, flexShrink: 0, borderLeft: '1px solid var(--border-sub)', overflowY: 'auto' }}
            >
              <QuestionEditor question={selectedQ} onUpdate={updateQuestion} onDelete={deleteQuestion} />
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
  const primary = theme?.primary ?? '#c9a84c'
  const accent  = theme?.accent  ?? '#ddb96a'

  return (
    <motion.div
      key={q.id}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      style={{
        width: '100%', maxWidth: 520,
        padding: '48px 52px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-sub)',
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${primary}, ${accent}, transparent)` }} />

      {/* Type badge */}
      <p className="caps" style={{ color: 'var(--text-35)', marginBottom: 28, fontSize: '10px' }}>
        {TYPE_META[q.type].label}
      </p>

      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(26px, 3.5vw, 38px)',
          fontWeight: 300,
          color: 'var(--text)',
          lineHeight: 1.15,
          marginBottom: q.subtitle ? 12 : 28,
        }}
      >
        {q.title}
        {q.config.required && <span style={{ color: primary }}> *</span>}
      </h2>

      {q.subtitle && (
        <p style={{ color: 'var(--text-60)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: 28 }}>{q.subtitle}</p>
      )}

      {/* Input previews */}
      {(q.type === 'short_text' || q.type === 'email' || q.type === 'phone') && (
        <div style={{ borderBottom: `1px solid ${primary}40`, paddingBottom: 8, marginBottom: 28 }}>
          <p style={{ color: 'var(--text-35)', fontSize: '0.9rem' }}>{q.config.placeholder || 'Type your answer…'}</p>
        </div>
      )}
      {q.type === 'long_text' && (
        <div style={{ border: `1px solid ${primary}30`, borderRadius: 3, padding: '12px 14px', marginBottom: 28, minHeight: 80 }}>
          <p style={{ color: 'var(--text-35)', fontSize: '0.85rem' }}>{q.config.placeholder || 'Your answer…'}</p>
        </div>
      )}
      {q.type === 'yes_no' && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          {['Yes', 'No'].map(opt => (
            <div key={opt} style={{ flex: 1, padding: '12px', border: `1px solid ${primary}30`, borderRadius: 3, textAlign: 'center', color: 'var(--text-60)', fontSize: '0.9rem' }}>
              {opt}
            </div>
          ))}
        </div>
      )}
      {q.type === 'multiple_choice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
          {(q.config.options ?? []).map((opt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `1px solid ${primary}20`, borderRadius: 3 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1px solid ${primary}50`, flexShrink: 0 }} />
              <span style={{ color: 'var(--text-60)', fontSize: '0.85rem' }}>{opt}</span>
            </div>
          ))}
        </div>
      )}
      {q.type === 'rating' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {[...Array(q.config.max_rating ?? 5)].map((_, i) => (
            <div key={i} style={{ width: 28, height: 28, border: `1px solid ${primary}30`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--text-35)' }}>{i + 1}</span>
            </div>
          ))}
        </div>
      )}

      {q.type !== 'thank_you' && (
        <button style={{ padding: '10px 22px', border: `1px solid ${primary}`, background: 'transparent', color: primary, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: 2, cursor: 'default' }}>
          {q.type === 'welcome' ? 'Begin →' : 'Continue →'}
        </button>
      )}
    </motion.div>
  )
}

/* ── Question Editor ── */
function QuestionEditor({ question, onUpdate, onDelete }: {
  question: Question; onUpdate: (q: Question) => void; onDelete: (id: string) => void
}) {
  const [q, setQ] = useState(question)
  useEffect(() => { setQ(question) }, [question])

  function update(patch: Partial<Question>) {
    const updated = { ...q, ...patch }
    setQ(updated); onUpdate(updated)
  }
  function cfg(patch: Partial<Question['config']>) {
    update({ config: { ...q.config, ...patch } })
  }

  return (
    <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border-sub)' }}>
        <p className="caps" style={{ color: 'var(--text-35)', fontSize: '10px' }}>
          {TYPE_META[q.type].label}
        </p>
        <button className="btn-danger" style={{ padding: '5px 10px', fontSize: '10px' }} onClick={() => onDelete(q.id)}>
          Delete
        </button>
      </div>

      <Field label="Title">
        <textarea
          className="input-box"
          value={q.title}
          onChange={e => update({ title: e.target.value })}
          rows={2}
          style={{ resize: 'none' }}
        />
      </Field>

      <Field label="Subtitle">
        <textarea
          className="input-box"
          value={q.subtitle ?? ''}
          onChange={e => update({ subtitle: e.target.value || null })}
          rows={2}
          style={{ resize: 'none' }}
        />
      </Field>

      {(q.type === 'short_text' || q.type === 'long_text' || q.type === 'email' || q.type === 'phone') && (
        <Field label="Placeholder text">
          <input className="input-box" value={q.config.placeholder ?? ''} onChange={e => cfg({ placeholder: e.target.value })} />
        </Field>
      )}

      {q.type === 'multiple_choice' && (
        <div>
          <p className="caps" style={{ color: 'var(--text-35)', marginBottom: 10, fontSize: '10px' }}>Options</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(q.config.options ?? []).map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  className="input-box"
                  value={opt}
                  onChange={e => {
                    const opts = [...(q.config.options ?? [])]
                    opts[i] = e.target.value
                    cfg({ options: opts })
                  }}
                  style={{ flex: 1 }}
                />
                <button
                  style={{ padding: '4px 8px', background: 'transparent', border: '1px solid rgba(220,80,80,0.2)', borderRadius: 2, color: 'rgba(220,100,100,0.6)', fontSize: '10px', cursor: 'pointer' }}
                  onClick={() => cfg({ options: q.config.options?.filter((_, idx) => idx !== i) })}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              style={{ padding: '7px 10px', background: 'transparent', border: '1px dashed var(--border-sub)', borderRadius: 2, color: 'var(--text-35)', fontSize: '11px', cursor: 'pointer', marginTop: 2 }}
              onClick={() => cfg({ options: [...(q.config.options ?? []), `Option ${(q.config.options?.length ?? 0) + 1}`] })}
            >
              + Add option
            </button>
          </div>
        </div>
      )}

      {q.type === 'rating' && (
        <Field label="Max stars">
          <select
            className="input-box"
            value={q.config.max_rating ?? 5}
            onChange={e => cfg({ max_rating: +e.target.value })}
          >
            {[3, 5, 7, 10].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>
      )}

      {q.type !== 'welcome' && q.type !== 'thank_you' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 4 }}>
          <button
            onClick={() => cfg({ required: !q.config.required })}
            style={{
              width: 34, height: 18, borderRadius: 9, border: 'none', cursor: 'pointer',
              background: q.config.required ? 'var(--gold)' : 'var(--bg-elevated)',
              transition: 'background 0.2s', position: 'relative', flexShrink: 0,
            }}
          >
            <div style={{
              position: 'absolute', top: 2, width: 14, height: 14, borderRadius: '50%', background: 'var(--text)',
              transition: 'left 0.2s', left: q.config.required ? 18 : 2,
            }} />
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
      <p className="caps" style={{ color: 'var(--text-35)', marginBottom: 8, fontSize: '10px' }}>{label}</p>
      {children}
    </div>
  )
}
