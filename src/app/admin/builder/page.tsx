'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import Link from 'next/link'
import { supabase, type Form, type Question, type QuestionType } from '@/lib/supabase'
import {
  ArrowLeft, Plus, Trash2, GripVertical, Eye, Settings,
  Type, AlignLeft, ToggleLeft, List, Star, Mail, Phone,
  Play, CheckSquare, Globe, Lock
} from 'lucide-react'

export const dynamic = 'force-static'

const TYPE_META: Record<QuestionType, { icon: React.ElementType; label: string; color: string }> = {
  welcome: { icon: Play, label: 'Welcome Screen', color: '#6366f1' },
  short_text: { icon: Type, label: 'Short Text', color: '#8b5cf6' },
  long_text: { icon: AlignLeft, label: 'Long Text', color: '#7c3aed' },
  yes_no: { icon: ToggleLeft, label: 'Yes / No', color: '#ec4899' },
  multiple_choice: { icon: List, label: 'Multiple Choice', color: '#f59e0b' },
  rating: { icon: Star, label: 'Rating', color: '#f97316' },
  email: { icon: Mail, label: 'Email', color: '#06b6d4' },
  phone: { icon: Phone, label: 'Phone', color: '#10b981' },
  thank_you: { icon: CheckSquare, label: 'Thank You', color: '#34d399' },
}

function BuilderInner() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const [form, setForm] = useState<Form | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddMenu, setShowAddMenu] = useState(false)

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id])

  async function loadData() {
    const [{ data: f }, { data: q }] = await Promise.all([
      supabase.from('forms').select('*').eq('id', id!).single(),
      supabase.from('questions').select('*').eq('form_id', id!).order('position'),
    ])
    setForm(f)
    setQuestions(q ?? [])
    setLoading(false)
  }

  async function addQuestion(type: QuestionType) {
    setShowAddMenu(false)
    const defaults = {
      form_id: id!,
      position: questions.length,
      type,
      title: type === 'welcome' ? 'Welcome!' : type === 'thank_you' ? 'Thank you!' : 'Your question here',
      subtitle: type === 'welcome' ? "We're excited to work with you. Let's get started." : null,
      config: type === 'multiple_choice' ? { options: ['Option A', 'Option B', 'Option C'] }
        : type === 'rating' ? { max_rating: 5 }
        : { placeholder: '', required: false },
    }
    const { data } = await supabase.from('questions').insert(defaults).select().single()
    if (data) {
      setQuestions(q => [...q, data as Question])
      setSelected(data.id)
    }
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

  if (!id) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0b14' }}><p style={{ color: 'rgba(255,255,255,0.4)' }}>No form ID provided.</p></div>

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0b14' }}>
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0b0b14' }}>
      {/* Top bar */}
      <div className="border-b shrink-0 z-20 sticky top-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(11,11,20,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <motion.button whileHover={{ x: -2 }} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <ArrowLeft size={14} /> Dashboard
              </motion.button>
            </Link>
            <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <span className="font-semibold text-white">{form?.title}</span>
            {form?.client_name && <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>— {form.client_name}</span>}
          </div>
          <div className="flex items-center gap-3">
            {saving && <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Saving…</span>}
            {form?.is_published && (
              <Link href={`/form?slug=${form.slug}`} target="_blank">
                <motion.button whileHover={{ scale: 1.03 }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                  <Eye size={14} /> Preview
                </motion.button>
              </Link>
            )}
            <Link href={`/admin/responses?id=${id}`}>
              <motion.button whileHover={{ scale: 1.03 }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
                Responses
              </motion.button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={togglePublish}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: form?.is_published ? 'rgba(239,68,68,0.2)' : 'linear-gradient(135deg,#6366f1,#ec4899)' }}
            >
              {form?.is_published ? <><Lock size={14} /> Unpublish</> : <><Globe size={14} /> Publish</>}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>
        {/* Left: question list */}
        <div className="w-72 shrink-0 border-r flex flex-col" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
          <div className="p-4 border-b relative" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Slides ({questions.length})
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ background: 'rgba(99,102,241,0.2)', border: '1px dashed rgba(99,102,241,0.4)' }}
            >
              <Plus size={14} /> Add Slide
            </motion.button>
            <AnimatePresence>
              {showAddMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute top-full left-4 right-4 mt-2 rounded-xl overflow-hidden z-30"
                  style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
                >
                  {(Object.keys(TYPE_META) as QuestionType[]).map(type => {
                    const { icon: Icon, label, color } = TYPE_META[type]
                    return (
                      <motion.button
                        key={type}
                        whileHover={{ background: 'rgba(255,255,255,0.05)' }}
                        onClick={() => addQuestion(type)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left"
                      >
                        <Icon size={14} style={{ color }} />
                        <span style={{ color: 'rgba(255,255,255,0.8)' }}>{label}</span>
                      </motion.button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {questions.length === 0 ? (
              <p className="text-center text-xs py-8" style={{ color: 'rgba(255,255,255,0.25)' }}>No slides yet.<br />Add your first above.</p>
            ) : (
              <Reorder.Group axis="y" values={questions} onReorder={reorder} className="flex flex-col gap-2">
                {questions.map((q, i) => {
                  const { icon: Icon, label, color } = TYPE_META[q.type]
                  const isSelected = selected === q.id
                  return (
                    <Reorder.Item key={q.id} value={q}>
                      <motion.div
                        whileHover={{ x: 2 }}
                        onClick={() => setSelected(q.id)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                        style={{
                          background: isSelected ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isSelected ? 'rgba(99,102,241,0.4)' : 'transparent'}`,
                        }}
                      >
                        <GripVertical size={12} style={{ color: 'rgba(255,255,255,0.2)', cursor: 'grab', flexShrink: 0 }} />
                        <span className="text-xs font-medium shrink-0" style={{ color: 'rgba(255,255,255,0.3)', width: 16 }}>{i + 1}</span>
                        <Icon size={13} style={{ color, flexShrink: 0 }} />
                        <span className="text-sm truncate text-white flex-1">{q.title}</span>
                      </motion.div>
                    </Reorder.Item>
                  )
                })}
              </Reorder.Group>
            )}
          </div>
        </div>

        {/* Center: preview */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at center, ${form?.theme?.primary ?? '#6366f1'}15 0%, transparent 70%)` }} />
          {selectedQ ? (
            <SlidePreview question={selectedQ} theme={form?.theme} />
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <Settings size={28} style={{ color: '#6366f1' }} />
              </div>
              <p className="text-white font-medium mb-1">Select a slide to edit</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>or add a new slide from the left panel</p>
            </div>
          )}
        </div>

        {/* Right: editor */}
        {selectedQ && (
          <QuestionEditor question={selectedQ} onUpdate={updateQuestion} onDelete={deleteQuestion} />
        )}
      </div>
    </div>
  )
}

export default function BuilderPage() {
  return <Suspense fallback={<div className="min-h-screen" style={{ background: '#0b0b14' }} />}><BuilderInner /></Suspense>
}

function SlidePreview({ question: q, theme }: { question: Question; theme?: Form['theme'] }) {
  const { icon: Icon, color } = TYPE_META[q.type]
  const primary = theme?.primary ?? '#6366f1'
  const accent = theme?.accent ?? '#ec4899'

  return (
    <motion.div
      key={q.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-xl rounded-3xl p-10 flex flex-col gap-6"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {TYPE_META[q.type].label}
        </span>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white leading-tight">{q.title}</h2>
        {q.subtitle && <p className="mt-2 text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>{q.subtitle}</p>}
      </div>
      {(q.type === 'short_text' || q.type === 'email' || q.type === 'phone') && (
        <div className="h-12 rounded-xl border flex items-center px-4 text-sm"
          style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${primary}50`, color: 'rgba(255,255,255,0.25)' }}>
          {q.config.placeholder || 'Type your answer…'}
        </div>
      )}
      {q.type === 'long_text' && (
        <div className="h-28 rounded-xl border flex items-start p-4 text-sm"
          style={{ background: 'rgba(255,255,255,0.05)', borderColor: `${primary}50`, color: 'rgba(255,255,255,0.25)' }}>
          {q.config.placeholder || 'Your answer…'}
        </div>
      )}
      {q.type === 'yes_no' && (
        <div className="flex gap-4">
          {['Yes', 'No'].map(opt => (
            <div key={opt} className="flex-1 py-3 rounded-xl text-center font-semibold border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>{opt}</div>
          ))}
        </div>
      )}
      {q.type === 'multiple_choice' && (
        <div className="flex flex-col gap-2">
          {(q.config.options ?? []).map((opt, i) => (
            <div key={i} className="flex items-center gap-3 py-3 px-4 rounded-xl border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="w-5 h-5 rounded-full border-2 shrink-0" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{opt}</span>
            </div>
          ))}
        </div>
      )}
      {q.type === 'rating' && (
        <div className="flex gap-2">
          {[...Array(q.config.max_rating ?? 5)].map((_, i) => (
            <Star key={i} size={28} style={{ color: 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>
      )}
      {(q.type === 'welcome' || q.type === 'thank_you' || true) && q.type !== 'welcome' && q.type !== 'thank_you' && (
        <button className="self-start px-6 py-2.5 rounded-xl text-sm font-semibold text-white mt-2"
          style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>Continue →</button>
      )}
      {q.type === 'welcome' && (
        <button className="self-start px-8 py-3 rounded-xl text-sm font-semibold text-white"
          style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>Get Started →</button>
      )}
    </motion.div>
  )
}

function QuestionEditor({ question, onUpdate, onDelete }: {
  question: Question
  onUpdate: (q: Question) => void
  onDelete: (id: string) => void
}) {
  const [q, setQ] = useState(question)

  useEffect(() => { setQ(question) }, [question])

  function update(patch: Partial<Question>) {
    const updated = { ...q, ...patch }
    setQ(updated)
    onUpdate(updated)
  }

  function updateConfig(patch: Partial<Question['config']>) {
    update({ config: { ...q.config, ...patch } })
  }

  function updateOption(i: number, val: string) {
    const options = [...(q.config.options ?? [])]
    options[i] = val
    updateConfig({ options })
  }

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-80 shrink-0 border-l overflow-y-auto p-5 flex flex-col gap-5"
      style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white">Edit Slide</span>
        <motion.button whileHover={{ scale: 1.05 }} onClick={() => onDelete(q.id)}
          className="p-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
          <Trash2 size={14} />
        </motion.button>
      </div>

      <Field label="Title">
        <input value={q.title} onChange={e => update({ title: e.target.value })}
          className="w-full px-3 py-2.5 rounded-lg text-sm text-white"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
      </Field>

      <Field label="Subtitle / Description">
        <textarea value={q.subtitle ?? ''} onChange={e => update({ subtitle: e.target.value || null })}
          rows={2} className="w-full px-3 py-2 rounded-lg text-sm text-white resize-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
      </Field>

      {(q.type === 'short_text' || q.type === 'long_text' || q.type === 'email' || q.type === 'phone') && (
        <Field label="Placeholder">
          <input value={q.config.placeholder ?? ''} onChange={e => updateConfig({ placeholder: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </Field>
      )}

      {q.type === 'multiple_choice' && (
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Options</p>
          <div className="flex flex-col gap-2">
            {(q.config.options ?? []).map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={opt} onChange={e => updateOption(i, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm text-white"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                <button onClick={() => updateConfig({ options: q.config.options?.filter((_, idx) => idx !== i) })}
                  style={{ color: '#f87171' }}><Trash2 size={12} /></button>
              </div>
            ))}
            <button onClick={() => updateConfig({ options: [...(q.config.options ?? []), `Option ${(q.config.options?.length ?? 0) + 1}`] })}
              className="flex items-center gap-1 text-xs mt-1" style={{ color: '#a5b4fc' }}>
              <Plus size={12} /> Add option
            </button>
          </div>
        </div>
      )}

      {q.type === 'rating' && (
        <Field label="Max Rating">
          <select value={q.config.max_rating ?? 5} onChange={e => updateConfig({ max_rating: +e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg text-sm text-white"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {[3, 5, 7, 10].map(n => <option key={n} value={n}>{n} stars</option>)}
          </select>
        </Field>
      )}

      {q.type !== 'welcome' && q.type !== 'thank_you' && (
        <label className="flex items-center gap-3 cursor-pointer" onClick={() => updateConfig({ required: !q.config.required })}>
          <div className="w-10 h-6 rounded-full relative transition-colors" style={{ background: q.config.required ? '#6366f1' : 'rgba(255,255,255,0.1)' }}>
            <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all" style={{ left: q.config.required ? '22px' : '4px' }} />
          </div>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Required</span>
        </label>
      )}
    </motion.div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</p>
      {children}
    </div>
  )
}
