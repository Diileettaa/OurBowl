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

  // ... 前面的 imports 和 logic 不变 ...

  return (
    <div className="flex flex-col items-center justify-center py-4 relative">
      
      {/* 🥣 The Bowl (Container) */}
      <div className="relative w-40 h-20 bg-white border-2 border-gray-100 rounded-b-full shadow-xl flex justify-center items-end overflow-hidden">
        {/* 装饰纹理 */}
        <div className="absolute top-2 left-0 w-full h-px bg-blue-100/50"></div>
        
        {/* 🦀 The Guardian (Inside the bowl) */}
        <motion.div
          animate={status}
          variants={variants}
          className="mb-2 text-6xl relative z-10 cursor-pointer"
          whileHover={{ scale: 1.2, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* 根据状态改变形象 */}
          {status === 'happy' ? '🦀' : status === 'hungry' ? '🐚' : '💤'}
        </motion.div>
      </div>
      
      {/* Bowl Shadow */}
      <div className="w-32 h-4 bg-black/5 rounded-[100%] blur-md mt-2"></div>

      {/* Status Text */}
      <div className="mt-4 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-xs font-bold text-gray-500 flex items-center gap-2">
         <div className={`w-2 h-2 rounded-full ${status === 'happy' ? 'bg-green-400' : 'bg-red-400'}`}></div>
         {status === 'happy' ? "Happy Guardian" : "Needs Food"}
      </div>
    </div>
  )
}