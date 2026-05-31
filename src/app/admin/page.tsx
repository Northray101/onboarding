'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { supabase, type Form } from '@/lib/supabase'
import { Plus, FileText, Eye, Pencil, Trash2, BarChart3, Globe, Lock, ArrowLeft } from 'lucide-react'

export default function AdminPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadForms()
  }, [])

  async function loadForms() {
    const { data } = await supabase.from('forms').select('*').order('created_at', { ascending: false })
    setForms(data ?? [])
    setLoading(false)
  }

  async function deleteForm(id: string) {
    setDeleting(id)
    await supabase.from('forms').delete().eq('id', id)
    setForms(f => f.filter(x => x.id !== id))
    setDeleting(null)
  }

  async function togglePublish(form: Form) {
    await supabase.from('forms').update({ is_published: !form.is_published }).eq('id', form.id)
    setForms(f => f.map(x => x.id === form.id ? { ...x, is_published: !x.is_published } : x))
  }

  return (
    <div className="min-h-screen" style={{ background: '#0b0b14' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <motion.button whileHover={{ x: -2 }} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <ArrowLeft size={14} /> Home
              </motion.button>
            </Link>
            <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          </div>
          <Link href="/admin/forms/new">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}
            >
              <Plus size={16} /> New Form
            </motion.button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-52 rounded-2xl glass animate-pulse" />
            ))}
          </div>
        ) : forms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32"
          >
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <FileText size={32} style={{ color: '#6366f1' }} />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">No forms yet</h2>
            <p className="mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Create your first client onboarding form</p>
            <Link href="/admin/forms/new">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 rounded-xl font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}
              >
                Create Form
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {forms.map((form, i) => (
                <motion.div
                  key={form.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl p-6 flex flex-col gap-4 group hover:border-white/20 transition-all"
                >
                  {/* Color bar */}
                  <div className="h-1.5 rounded-full w-full" style={{
                    background: `linear-gradient(90deg, ${form.theme?.primary ?? '#6366f1'}, ${form.theme?.accent ?? '#ec4899'})`
                  }} />

                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate text-lg">{form.title}</h3>
                      {form.client_name && (
                        <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {form.client_name}
                        </p>
                      )}
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ml-3 shrink-0 ${
                      form.is_published
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-white/5 text-white/40'
                    }`}>
                      {form.is_published ? <Globe size={10} /> : <Lock size={10} />}
                      {form.is_published ? 'Live' : 'Draft'}
                    </span>
                  </div>

                  {form.description && (
                    <p className="text-sm line-clamp-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {form.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-2 mt-auto border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <Link href={`/admin/builder?id=${form.id}`} className="flex-1">
                      <motion.button whileHover={{ scale: 1.02 }} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium text-white"
                        style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <Pencil size={13} /> Edit
                      </motion.button>
                    </Link>
                    {form.is_published && (
                      <Link href={`/form?slug=${form.slug}`} target="_blank" className="flex-1">
                        <motion.button whileHover={{ scale: 1.02 }} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium"
                          style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                          <Eye size={13} /> Preview
                        </motion.button>
                      </Link>
                    )}
                    <Link href={`/admin/responses?id=${form.id}`} className="flex-1">
                      <motion.button whileHover={{ scale: 1.02 }} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium"
                        style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
                        <BarChart3 size={13} /> Responses
                      </motion.button>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => deleteForm(form.id)}
                      disabled={deleting === form.id}
                      className="p-2 rounded-xl transition-colors"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
                    >
                      <Trash2 size={13} />
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    onClick={() => togglePublish(form)}
                    className="w-full py-2 rounded-xl text-xs font-medium transition-colors"
                    style={{
                      background: form.is_published ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
                      color: form.is_published ? '#f87171' : '#34d399',
                    }}
                  >
                    {form.is_published ? 'Unpublish' : 'Publish Form'}
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
