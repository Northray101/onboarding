'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'

const PRESETS = [
  { label: 'Brand Design', desc: 'Logo, colors, typography, brand voice' },
  { label: 'Web Design', desc: 'Goals, pages, features, timeline' },
  { label: 'Social Media', desc: 'Platforms, audience, content style' },
  { label: 'Photography', desc: 'Style, location, deliverables, dates' },
  { label: 'Copywriting', desc: 'Tone, audience, channels, keywords' },
  { label: 'Custom', desc: 'Start with a blank form' },
]

const THEMES = [
  { name: 'Indigo', primary: '#6366f1', accent: '#ec4899', bg: '#0b0b14' },
  { name: 'Violet', primary: '#8b5cf6', accent: '#06b6d4', bg: '#0d0b14' },
  { name: 'Rose', primary: '#f43f5e', accent: '#fb923c', bg: '#140b0b' },
  { name: 'Emerald', primary: '#10b981', accent: '#6366f1', bg: '#0b140e' },
  { name: 'Amber', primary: '#f59e0b', accent: '#ec4899', bg: '#14110b' },
]

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).slice(2, 6)
}

export default function NewFormPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [clientName, setClientName] = useState('')
  const [description, setDescription] = useState('')
  const [theme, setTheme] = useState(THEMES[0])
  const [saving, setSaving] = useState(false)

  async function create() {
    if (!title.trim()) return
    setSaving(true)
    const { data, error } = await supabase.from('forms').insert({
      title,
      client_name: clientName || null,
      description: description || null,
      slug: slugify(title),
      theme: { primary: theme.primary, accent: theme.accent, bg: theme.bg },
      is_published: false,
    }).select().single()
    if (data && !error) {
      router.push(`/admin/builder?id=${data.id}`)
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0b0b14' }}>
      <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link href="/admin">
            <motion.button whileHover={{ x: -2 }} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <ArrowLeft size={14} /> Dashboard
            </motion.button>
          </Link>
          <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <h1 className="text-xl font-semibold text-white">New Form</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 w-full flex-1">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Step 0: preset */}
          {step === 0 && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Choose a template</h2>
              <p className="mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Start from a preset or build from scratch</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {PRESETS.map((p) => (
                  <motion.button
                    key={p.label}
                    whileHover={{ scale: 1.03, borderColor: '#6366f1' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (p.label !== 'Custom') setTitle(`${p.label} Onboarding`)
                      setStep(1)
                    }}
                    className="glass rounded-2xl p-5 text-left transition-all"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="font-semibold text-white mb-1">{p.label}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{p.desc}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: details */}
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Form details</h2>
              <p className="mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Name your form and set it up for your client</p>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Form Title *</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Brand Design Onboarding"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder:opacity-30 focus:ring-2 focus:ring-indigo-500"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Client Name</label>
                  <input
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-4 py-3 rounded-xl text-white placeholder:opacity-30 focus:ring-2 focus:ring-indigo-500"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Brief description of this form..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-white placeholder:opacity-30 focus:ring-2 focus:ring-indigo-500 resize-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>Theme Color</label>
                  <div className="flex gap-3 flex-wrap">
                    {THEMES.map(t => (
                      <motion.button
                        key={t.name}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setTheme(t)}
                        title={t.name}
                        className="w-10 h-10 rounded-full relative"
                        style={{
                          background: `linear-gradient(135deg, ${t.primary}, ${t.accent})`,
                          boxShadow: theme.name === t.name ? `0 0 0 3px white, 0 0 0 5px ${t.primary}` : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setStep(0)}
                    className="px-5 py-3 rounded-xl font-medium"
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={create}
                    disabled={!title.trim() || saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', opacity: (!title.trim() || saving) ? 0.5 : 1 }}
                  >
                    {saving ? 'Creating...' : <><Sparkles size={16} /> Create & Open Builder</>}
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
