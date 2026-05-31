'use client'

export const dynamic = 'force-static'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase, type Form, type Question, type Response } from '@/lib/supabase'
import { ArrowLeft, Inbox, ChevronDown, ChevronUp } from 'lucide-react'

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
      setForm(f)
      setQuestions(q ?? [])
      setResponses(r ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  if (!id) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0b14' }}><p style={{ color: 'rgba(255,255,255,0.4)' }}>No form ID.</p></div>
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0b14' }}>
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#0b0b14' }}>
      <div className="border-b sticky top-0 z-10" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(11,11,20,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link href={`/admin/builder?id=${id}`}>
            <motion.button whileHover={{ x: -2 }} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <ArrowLeft size={14} /> Builder
            </motion.button>
          </Link>
          <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <h1 className="text-xl font-semibold text-white">{form?.title} — Responses</h1>
          <span className="ml-auto px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
            {responses.length} response{responses.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {responses.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <Inbox size={32} style={{ color: '#6366f1' }} />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">No responses yet</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>Share your published form to start collecting responses</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            {responses.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="glass rounded-2xl overflow-hidden">
                <button onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}>{responses.length - i}</div>
                    <div>
                      <p className="text-white font-medium text-sm">Response #{responses.length - i}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{new Date(r.submitted_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {expanded === r.id ? <ChevronUp size={16} style={{ color: 'rgba(255,255,255,0.4)' }} /> : <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />}
                </button>
                {expanded === r.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    className="border-t px-6 pb-6 pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex flex-col gap-4">
                      {questions.filter(q => q.type !== 'welcome' && q.type !== 'thank_you').map(q => {
                        const answer = (r.answers as Record<string, unknown>)[q.id]
                        if (answer == null) return null
                        return (
                          <div key={q.id}>
                            <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{q.title}</p>
                            <p className="text-sm text-white">{String(answer)}</p>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResponsesPage() {
  return <Suspense fallback={<div className="min-h-screen" style={{ background: '#0b0b14' }} />}><ResponsesInner /></Suspense>
}
