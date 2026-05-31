'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const E = [0.16, 1, 0.3, 1] as [number, number, number, number]

const blurUp = (delay = 0) => ({
  initial: { opacity: 0, filter: 'blur(12px)', y: 16 },
  animate: { opacity: 1, filter: 'blur(0px)', y: 0 },
  transition: { duration: 0.75, ease: E, delay },
})

const features = [
  {
    n: '01',
    title: 'Slide Builder',
    desc: 'Nine question types arranged as elegant slides — text, yes/no, multiple choice, rating, and more.',
  },
  {
    n: '02',
    title: 'Animated Forms',
    desc: 'Clients experience a full-screen, cinematic form with smooth blur transitions between every question.',
  },
  {
    n: '03',
    title: 'Response Dashboard',
    desc: 'Every submission lands in a clean, expandable view — organised and ready to review.',
  },
]

export default function Home() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Sky gradient wash — top */}
      <div
        aria-hidden
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '55vh', pointerEvents: 'none', zIndex: 0,
          background: 'linear-gradient(180deg, rgba(184,221,242,0.32) 0%, transparent 100%)',
        }}
      />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 44px', position: 'relative', zIndex: 1 }}>

        {/* Nav */}
        <motion.nav
          {...blurUp(0)}
          className="flex items-center justify-between"
          style={{ paddingTop: 32, paddingBottom: 32, borderBottom: '1px solid var(--border-sub)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, var(--sky), var(--sky-light))', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '17px', color: 'var(--sky-deep)', letterSpacing: '-0.01em' }}>
              ClientForm
            </span>
          </div>
          <Link href="/admin">
            <button className="btn-sky" style={{ padding: '9px 22px', fontSize: '13px' }}>
              Dashboard →
            </button>
          </Link>
        </motion.nav>

        {/* Hero */}
        <section style={{ paddingTop: '12vh', paddingBottom: '8vh' }}>

          <motion.div {...blurUp(0.1)} style={{ marginBottom: 32 }}>
            <span className="caps" style={{ color: 'var(--sky)', background: 'var(--sky-dim)', padding: '5px 12px', borderRadius: 100, display: 'inline-block' }}>
              Creative Client Onboarding
            </span>
          </motion.div>

          <motion.h1
            {...blurUp(0.22)}
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 100,
              fontSize: 'clamp(58px, 9vw, 124px)',
              lineHeight: 0.92,
              color: 'var(--text)',
              letterSpacing: '-0.03em',
              marginBottom: 0,
            }}
          >
            Beautiful
            <br />
            <em style={{ color: 'var(--sky-deep)' }}>onboarding,</em>
            <br />
            done right.
          </motion.h1>

          {/* Animated sky rule */}
          <motion.div
            className="rule-sky"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: E, delay: 0.6 }}
            style={{ marginTop: '7vh', transformOrigin: 'left' }}
          />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10" style={{ marginTop: '5vh' }}>
            <motion.p {...blurUp(0.55)} style={{ maxWidth: 440, color: 'var(--text-60)', lineHeight: 1.8, fontSize: '1.05rem' }}>
              Create stunning, animated forms tailored for each client.
              Slide-by-slide questions, blur transitions, six field types —
              and a dashboard for every response.
            </motion.p>

            <motion.div {...blurUp(0.68)} style={{ flexShrink: 0 }}>
              <Link href="/admin">
                <button className="btn-sky" style={{ padding: '14px 34px', fontSize: '14px' }}>
                  Open Dashboard →
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section style={{ paddingBottom: '10vh' }}>
          {features.map((f, i) => (
            <motion.div
              key={f.n}
              initial={{ opacity: 0, filter: 'blur(8px)', y: 12 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ duration: 0.65, ease: E, delay: 0.8 + i * 0.13 }}
            >
              <div
                className="flex items-start gap-8"
                style={{
                  padding: '36px 0',
                  borderBottom: '1px solid var(--border-sub)',
                }}
              >
                <span className="caps" style={{ color: 'var(--sky)', width: 28, flexShrink: 0, paddingTop: 4 }}>
                  {f.n}
                </span>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 400,
                      fontSize: '22px',
                      color: 'var(--text)',
                      marginBottom: 8,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ color: 'var(--text-60)', lineHeight: 1.72, fontSize: '0.93rem', maxWidth: 480 }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Footer */}
        <motion.footer
          {...blurUp(1.1)}
          className="flex items-center justify-between"
          style={{ paddingTop: 24, paddingBottom: 36, borderTop: '1px solid var(--border-sub)' }}
        >
          <span className="caps" style={{ color: 'var(--text-15)' }}>ClientForm</span>
          <span style={{ fontSize: '11px', color: 'var(--text-35)' }}>Supabase · GitHub Pages</span>
        </motion.footer>
      </div>
    </div>
  )
}
