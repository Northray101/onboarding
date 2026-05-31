'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const E = ([0.16, 1, 0.3, 1]) as [number, number, number, number]

const features = [
  {
    roman: 'Ⅰ',
    title: 'Slide Builder',
    desc: 'Nine question types — text, yes/no, multiple choice, rating, and more — arranged as cinematic slides.',
  },
  {
    roman: 'Ⅱ',
    title: 'Animated Experience',
    desc: 'Each client sees a full-screen, immersive form with directional transitions and ambient motion.',
  },
  {
    roman: 'Ⅲ',
    title: 'Response Dashboard',
    desc: 'Every submission collected and organised in a clean, expandable view built for review.',
  },
]

export default function Home() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Ambient glow — top left */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: '-20%', left: '-10%',
          width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 65%)',
        }}
      />

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 40px' }}>
        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
          style={{ paddingTop: 36, paddingBottom: 36, borderBottom: '1px solid var(--border-sub)' }}
        >
          <span className="caps" style={{ color: 'var(--text-35)' }}>ClientForm</span>
          <Link href="/admin">
            <button className="btn-gold">Open Dashboard →</button>
          </Link>
        </motion.nav>

        {/* Hero */}
        <section style={{ paddingTop: '13vh', paddingBottom: '10vh' }}>
          <motion.p
            className="caps anim-fade-up"
            style={{ color: 'var(--gold)', marginBottom: 40 }}
          >
            Creative Client Onboarding
          </motion.p>

          <h1
            className="anim-fade-up d2"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 300,
              fontSize: 'clamp(56px, 8.5vw, 120px)',
              lineHeight: 0.93,
              color: 'var(--text)',
              letterSpacing: '-0.02em',
              marginBottom: 0,
            }}
          >
            Beautiful
            <br />
            <em>onboarding,</em>
            <br />
            done right.
          </h1>

          {/* Animated gold rule */}
          <motion.div
            className="rule-gold"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: E, delay: 0.55 }}
            style={{ marginTop: '7vh', transformOrigin: 'left' }}
          />

          <div
            className="flex flex-col md:flex-row md:items-end justify-between gap-10"
            style={{ marginTop: '5vh' }}
          >
            <motion.p
              className="anim-fade-up d5"
              style={{
                maxWidth: 460,
                color: 'var(--text-60)',
                lineHeight: 1.78,
                fontSize: '1.05rem',
              }}
            >
              Create stunning, animated forms tailored for each of your clients.
              Slide-by-slide questions, six field types, beautiful transitions —
              and a response dashboard for every submission.
            </motion.p>

            <motion.div
              className="anim-fade-up d6"
              style={{ flexShrink: 0 }}
            >
              <Link href="/admin">
                <button className="btn-gold" style={{ fontSize: '13px', padding: '14px 32px' }}>
                  Open Dashboard →
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section style={{ paddingBottom: '12vh' }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="anim-fade-up"
              style={{ animationDelay: `${0.7 + i * 0.12}s` }}
            >
              <div
                className="flex items-start gap-10"
                style={{
                  padding: '40px 0',
                  borderBottom: '1px solid var(--border-sub)',
                  cursor: 'default',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '16px',
                    color: 'var(--gold)',
                    width: 28,
                    flexShrink: 0,
                    paddingTop: 3,
                  }}
                >
                  {f.roman}
                </span>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '22px',
                      fontWeight: 400,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--text)',
                      marginBottom: 10,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p style={{ color: 'var(--text-60)', lineHeight: 1.7, maxWidth: 520, fontSize: '0.93rem' }}>
                    {f.desc}
                  </p>
                </div>
                <span
                  className="caps hidden md:block"
                  style={{ color: 'var(--text-12)', paddingTop: 4, flexShrink: 0 }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Footer */}
        <footer
          className="anim-fade-up d8 flex items-center justify-between"
          style={{ paddingTop: 28, paddingBottom: 36, borderTop: '1px solid var(--border-sub)' }}
        >
          <span className="caps" style={{ color: 'var(--text-12)' }}>ClientForm</span>
          <span style={{ fontSize: '11px', color: 'var(--text-35)' }}>
            Supabase + GitHub Pages
          </span>
        </footer>
      </div>
    </div>
  )
}
