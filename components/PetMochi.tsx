'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'

export default function PetMochi({ lastFedAt }: { lastFedAt: string }) {
  // 1. Calculate health status based on time
  const status = useMemo(() => {
    const lastFed = new Date(lastFedAt).getTime()
    const now = new Date().getTime()
    const hoursSince = (now - lastFed) / (1000 * 60 * 60)

    if (hoursSince < 24) return 'happy' // Fed within 24h
    if (hoursSince < 48) return 'hungry' // Fed within 48h
    return 'sleepy' // Not fed for > 48h
  }, [lastFedAt])

  // 2. Define styles for each state
  const variants = {
    happy: {
      color: '#FFD166', // Yellow
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
      transition: { repeat: Infinity, duration: 2 }
    },
    hungry: {
      color: '#118AB2', // Blue
      scale: [1, 1.05, 1],
      rotate: 0,
      transition: { repeat: Infinity, duration: 4 }
    },
    sleepy: {
      color: '#8D99AE', // Grey
      scale: [1, 0.9, 1], // Deflated
      rotate: 0,
      transition: { repeat: Infinity, duration: 5 }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* The Mochi Body */}
      <motion.div
        animate={status}
        variants={variants}
        className="w-32 h-32 rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] shadow-xl flex items-center justify-center relative"
        style={{ 
          backgroundColor: variants[status].color,
          boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.1)' 
        }}
      >
        {/* Eyes */}
        <div className="flex gap-4">
          <div className="w-3 h-3 bg-black/70 rounded-full animate-blink"></div>
          <div className="w-3 h-3 bg-black/70 rounded-full animate-blink"></div>
        </div>
        
        {/* Mouth (changes based on status) */}
        <div className="absolute bottom-8">
           {status === 'happy' && <div className="w-4 h-2 border-b-2 border-black/70 rounded-full"></div>}
           {status === 'hungry' && <div className="w-2 h-1 bg-black/70 rounded-full"></div>}
           {status === 'sleepy' && <div className="text-xs font-bold text-black/50">Zzz...</div>}
        </div>
      </motion.div>

      {/* Status Text */}
      <p className="mt-4 text-gray-400 text-sm font-mono">
        {status === 'happy' && "✨ I'm full of energy!"}
        {status === 'hungry' && "🥪 I'm a bit hungry..."}
        {status === 'sleepy' && "💤 I'm waiting for you..."}
      </p>
    </div>
  )
}