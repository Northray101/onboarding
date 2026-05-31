'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { supabase, type Form } from '@/lib/supabase'

const E = [0.16, 1, 0.3, 1] as [number, number, number, number]

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [hovering, setHovering] = useState<string | null>(null)

  useEffect(() => { loadForms() }, [])

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
    const next = !form.is_published
    await supabase.from('forms').update({ is_published: next }).eq('id', form.id)
    setForms(f => f.map(x => x.id === form.id ? { ...x, is_published: next } : x))
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Ambient */}
      <div className="fixed pointer-events-none" style={{ top: '-15%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 60%)' }} />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 40px' }}>
        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between"
          style={{ paddingTop: 36, paddingBottom: 36, borderBottom: '1px solid var(--border-sub)' }}
        >
          <div className="flex items-center gap-8">
            <Link href="/">
              <span className="caps" style={{ color: 'var(--text-35)', cursor: 'pointer' }}>← ClientForm</span>
            </Link>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '26px',
                fontWeight: 400,
                color: 'var(--text)',
              }}
            >
              Your Forms
            </span>
          </div>
          <Link href="/admin/forms/new">
            <button className="btn-gold">+ New Form</button>
          </Link>
        </motion.nav>

        {/* Count */}
        {!loading && forms.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="caps"
            style={{ color: 'var(--text-35)', paddingTop: 40, paddingBottom: 8 }}
          >
            {forms.length} form{forms.length !== 1 ? 's' : ''} total
          </motion.p>
        )}

        {/* List */}
        <div style={{ paddingBottom: '8vh' }}>
          {loading ? (
            <div style={{ paddingTop: 80 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ padding: '40px 0', borderBottom: '1px solid var(--border-sub)', opacity: 0.5 }}>
                  <div style={{ height: 12, width: '30%', background: 'var(--bg-elevated)', borderRadius: 2, marginBottom: 16 }} />
                  <div style={{ height: 28, width: '60%', background: 'var(--bg-elevated)', borderRadius: 2, marginBottom: 12 }} />
                  <div style={{ height: 10, width: '20%', background: 'var(--bg-elevated)', borderRadius: 2 }} />
                </div>
              ))}
            </div>
          ) : forms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: E }}
              style={{ textAlign: 'center', paddingTop: '15vh', paddingBottom: '15vh' }}
            >
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 300, color: 'var(--text)', marginBottom: 20 }}>
                No forms yet.
              </p>
              <p style={{ color: 'var(--text-60)', marginBottom: 40, fontSize: '0.95rem' }}>
                Create your first client onboarding form to get started.
              </p>
              <Link href="/admin/forms/new">
                <button className="btn-gold">Create your first form</button>
              </Link>
            </motion.div>
          ) : (
            <AnimatePresence>
              {forms.map((form, i) => (
                <motion.article
                  key={form.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.55, ease: E, delay: i * 0.06 }}
                  onMouseEnter={() => setHovering(form.id)}
                  onMouseLeave={() => setHovering(null)}
                  style={{
                    padding: '36px 0',
                    borderBottom: '1px solid var(--border-sub)',
                    position: 'relative',
                  }}
                >
                  {/* Left accent line on hover */}
                  <motion.div
                    animate={{ scaleY: hovering === form.id ? 1 : 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      position: 'absolute',
                      left: -40,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      background: 'var(--gold)',
                      transformOrigin: 'top',
                    }}
                  />

                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4" style={{ flex: 1, minWidth: 0 }}>
                      {/* Number */}
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '13px',
                          color: 'var(--text-35)',
                          paddingTop: 4,
                          flexShrink: 0,
                          width: 28,
                        }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {/* Title block */}
                      <div style={{ minWidth: 0 }}>
                        <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 8 }}>
                          <h2
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: 'clamp(22px, 3vw, 30px)',
                              fontWeight: 400,
                              color: 'var(--text)',
                              lineHeight: 1.1,
                            }}
                          >
                            {form.title}
                          </h2>
                          {/* Status */}
                          <span
                            className="caps"
                            style={{
                              color: form.is_published ? 'var(--gold)' : 'var(--text-35)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-block',
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                background: form.is_published ? 'var(--gold)' : 'var(--text-35)',
                              }}
                            />
                            {form.is_published ? 'Live' : 'Draft'}
                          </span>
                        </div>
                        {form.client_name && (
                          <p style={{ color: 'var(--text-35)', fontSize: '0.8rem', letterSpacing: '0.04em' }}>
                            for {form.client_name}
                          </p>
                        )}
                        {form.description && (
                          <p style={{ color: 'var(--text-60)', fontSize: '0.88rem', marginTop: 6, lineHeight: 1.6 }}>
                            {form.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Date */}
                    <span style={{ color: 'var(--text-35)', fontSize: '0.78rem', flexShrink: 0, paddingTop: 6 }}>
                      {fmt(form.created_at)}
                    </span>
                  </div>

                  {/* Theme color line */}
                  <div
                    style={{
                      height: 1,
                      margin: '20px 0',
                      background: `linear-gradient(90deg, ${form.theme?.primary ?? '#6366f1'}60, transparent 60%)`,
                    }}
                  />

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap" style={{ paddingLeft: 32 }}>
                    <Link href={`/admin/builder?id=${form.id}`}>
                      <button className="btn-ghost" style={{ fontSize: '11px' }}>Edit Form</button>
                    </Link>
                    {form.is_published && (
                      <Link href={`/form?slug=${form.slug}`} target="_blank">
                        <button className="btn-ghost" style={{ fontSize: '11px' }}>Preview ↗</button>
                      </Link>
                    )}
                    <Link href={`/admin/responses?id=${form.id}`}>
                      <button className="btn-ghost" style={{ fontSize: '11px' }}>Responses</button>
                    </Link>
                    <button
                      className="btn-ghost"
                      style={{ fontSize: '11px', color: form.is_published ? 'rgba(220,100,100,0.65)' : 'var(--gold)', borderColor: form.is_published ? 'rgba(220,80,80,0.18)' : 'var(--gold-dim)' }}
                      onClick={() => togglePublish(form)}
                    >
                      {form.is_published ? 'Unpublish' : 'Publish →'}
                    </button>
                    <button
                      className="btn-danger"
                      style={{ fontSize: '11px', marginLeft: 'auto' }}
                      onClick={() => deleteForm(form.id)}
                      disabled={deleting === form.id}
                    >
                      {deleting === form.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}
