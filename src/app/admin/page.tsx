'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { supabase, type Form } from '@/lib/supabase'

const E = [0.16, 1, 0.3, 1] as [number, number, number, number]

const blurUp = (delay = 0) => ({
  initial: { opacity: 0, filter: 'blur(10px)', y: 14 },
  animate: { opacity: 1, filter: 'blur(0px)', y: 0 },
  transition: { duration: 0.65, ease: E, delay },
})

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

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
      {/* Sky wash */}
      <div aria-hidden style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '40vh', pointerEvents: 'none', zIndex: 0, background: 'linear-gradient(180deg, rgba(184,221,242,0.25) 0%, transparent 100%)' }} />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 44px', position: 'relative', zIndex: 1 }}>

        {/* Nav */}
        <motion.nav {...blurUp(0)} className="flex items-center justify-between"
          style={{ paddingTop: 32, paddingBottom: 32, borderBottom: '1px solid var(--border-sub)' }}>
          <div className="flex items-center gap-6">
            <Link href="/">
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '17px', color: 'var(--sky-deep)', cursor: 'pointer' }}>
                ← ClientForm
              </span>
            </Link>
            <div style={{ width: 1, height: 18, background: 'var(--border-sub)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '24px', color: 'var(--text)', letterSpacing: '-0.015em' }}>
              Your Forms
            </span>
          </div>
          <Link href="/admin/forms/new">
            <button className="btn-sky">+ New Form</button>
          </Link>
        </motion.nav>

        {/* Content */}
        <div style={{ paddingTop: 48, paddingBottom: '8vh' }}>

          {loading ? (
            <div style={{ paddingTop: 60 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ padding: '32px 0', borderBottom: '1px solid var(--border-sub)', opacity: 0.45 }}>
                  <div style={{ height: 10, width: '25%', background: 'var(--bg-tint)', borderRadius: 3, marginBottom: 14 }} />
                  <div style={{ height: 26, width: '55%', background: 'var(--bg-tint)', borderRadius: 3, marginBottom: 10 }} />
                  <div style={{ height: 8, width: '18%', background: 'var(--bg-tint)', borderRadius: 3 }} />
                </div>
              ))}
            </div>

          ) : forms.length === 0 ? (
            <motion.div {...blurUp(0.1)} style={{ textAlign: 'center', paddingTop: '14vh', paddingBottom: '14vh' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-tint)', border: '1px solid var(--border)', margin: '0 auto 28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500, color: 'var(--sky)' }}>+</span>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '40px', color: 'var(--text)', marginBottom: 14, letterSpacing: '-0.015em' }}>
                No forms yet.
              </p>
              <p style={{ color: 'var(--text-60)', marginBottom: 36, fontSize: '0.95rem' }}>
                Create your first onboarding form to get started.
              </p>
              <Link href="/admin/forms/new">
                <button className="btn-sky">Create your first form</button>
              </Link>
            </motion.div>

          ) : (
            <AnimatePresence>
              {forms.map((form, i) => (
                <motion.article
                  key={form.id}
                  initial={{ opacity: 0, filter: 'blur(8px)', y: 10 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                  exit={{ opacity: 0, filter: 'blur(4px)', scale: 0.98 }}
                  transition={{ duration: 0.55, ease: E, delay: i * 0.07 }}
                  style={{ padding: '32px 0', borderBottom: '1px solid var(--border-sub)', position: 'relative' }}
                >
                  {/* Top accent: theme color stripe */}
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: form.theme?.primary ?? 'var(--sky)', borderRadius: '2px 0 0 2px', opacity: 0.7 }} />

                  <div style={{ paddingLeft: 20 }}>
                    {/* Meta row */}
                    <div className="flex items-start justify-between gap-4" style={{ marginBottom: 12 }}>
                      <div>
                        <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 6 }}>
                          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(20px, 3vw, 28px)', color: 'var(--text)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                            {form.title}
                          </h2>
                          <span
                            className="caps"
                            style={{
                              padding: '3px 10px',
                              borderRadius: 100,
                              fontSize: '10px',
                              background: form.is_published ? 'rgba(58,157,200,0.12)' : 'var(--bg-tint)',
                              color: form.is_published ? 'var(--sky-deep)' : 'var(--text-35)',
                              border: `1px solid ${form.is_published ? 'var(--sky-dim)' : 'var(--border-sub)'}`,
                            }}
                          >
                            {form.is_published ? '● Live' : '○ Draft'}
                          </span>
                        </div>
                        {form.client_name && (
                          <p style={{ color: 'var(--text-35)', fontSize: '0.82rem' }}>for {form.client_name}</p>
                        )}
                        {form.description && (
                          <p style={{ color: 'var(--text-60)', fontSize: '0.88rem', marginTop: 5, lineHeight: 1.6, maxWidth: 480 }}>{form.description}</p>
                        )}
                      </div>
                      <p style={{ color: 'var(--text-35)', fontSize: '0.78rem', flexShrink: 0, paddingTop: 4 }}>{fmt(form.created_at)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 16 }}>
                      <Link href={`/admin/builder?id=${form.id}`}>
                        <button className="btn-ghost" style={{ fontSize: '12px' }}>Edit Form</button>
                      </Link>
                      {form.is_published && (
                        <Link href={`/form?slug=${form.slug}`} target="_blank">
                          <button className="btn-ghost" style={{ fontSize: '12px' }}>Preview ↗</button>
                        </Link>
                      )}
                      <Link href={`/admin/responses?id=${form.id}`}>
                        <button className="btn-ghost" style={{ fontSize: '12px' }}>Responses</button>
                      </Link>
                      <button
                        className="btn-ghost"
                        onClick={() => togglePublish(form)}
                        style={{
                          fontSize: '12px',
                          color: form.is_published ? 'rgba(190,60,60,0.7)' : 'var(--sky-deep)',
                          borderColor: form.is_published ? 'rgba(220,80,80,0.2)' : 'var(--sky-dim)',
                        }}
                      >
                        {form.is_published ? 'Unpublish' : 'Publish →'}
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => deleteForm(form.id)}
                        disabled={deleting === form.id}
                        style={{ marginLeft: 'auto' }}
                      >
                        {deleting === form.id ? '…' : 'Delete'}
                      </button>
                    </div>
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
