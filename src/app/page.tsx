'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, ArrowRight, Layers, Zap, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0b0b14 0%, #110d1f 50%, #0b0b14 100%)' }}>
      {/* Animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }}
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }}
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl relative z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
          style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}
        >
          <Sparkles size={14} />
          Creative Client Onboarding
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-6xl font-bold mb-6 leading-tight"
        >
          <span className="gradient-text">Beautiful forms</span>
          <br />
          <span style={{ color: '#f8f8ff' }}>your clients will love</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl mb-12"
          style={{ color: 'rgba(248,248,255,0.6)' }}
        >
          Create stunning, animated onboarding forms tailored for each client.
          Slide-by-slide questions with beautiful transitions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <Link href="/admin">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white text-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}
            >
              Open Dashboard <ArrowRight size={20} />
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Feature cards */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-4xl w-full relative z-10"
      >
        {[
          { icon: Layers, title: 'Slide Builder', desc: 'Drag-and-drop question slides with 7+ field types' },
          { icon: Zap, title: 'Animated Experience', desc: 'Smooth transitions and micro-interactions for every slide' },
          { icon: BarChart3, title: 'Response Dashboard', desc: 'View all client responses in a clean analytics view' },
        ].map(({ icon: Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + i * 0.1 }}
            whileHover={{ y: -4, borderColor: 'rgba(99,102,241,0.4)' }}
            className="glass rounded-2xl p-6 transition-all"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(99,102,241,0.15)' }}>
              <Icon size={20} style={{ color: '#a5b4fc' }} />
            </div>
            <h3 className="font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm" style={{ color: 'rgba(248,248,255,0.5)' }}>{desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
