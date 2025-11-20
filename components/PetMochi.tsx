'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

export default function PetMochi({ lastFedAt }: { lastFedAt: string }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // 状态逻辑
  const getStatus = () => {
    const lastFed = new Date(lastFedAt).getTime()
    const now = new Date().getTime()
    return (now - lastFed) / (1000 * 60 * 60) < 24 ? 'active' : 'sleep'
  }
  const status = getStatus()

  // 眼神跟随
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - (rect.left + rect.width / 2)) / 15
      const y = (e.clientY - (rect.top + rect.height / 2)) / 15
      setMousePos({ x, y })
    }
    if (status === 'active') window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [status])

  return (
    <div ref={containerRef} className="relative flex flex-col items-center justify-center w-full h-full">
      
      {/* 状态徽章 (悬浮在两边) */}
      <div className="absolute top-0 w-full flex justify-between px-4 pointer-events-none z-0 opacity-80">
         <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-orange-400 shadow-sm">
            LV.1 Baby
         </div>
         <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-blue-400 shadow-sm">
            {status === 'active' ? '✨ Happy' : '💤 Sleepy'}
         </div>
      </div>

      {/* 🥣 碗的后壁 */}
      <div className="absolute bottom-4 w-40 h-20 bg-[#F3F4F6] rounded-b-[100px] border-2 border-white shadow-inner z-10"></div>

      {/* ✨ 团子本体 */}
      <motion.div
        className="relative z-20 mb-8 cursor-pointer"
        initial={false}
        animate={status === 'active' ? { y: [0, -6, 0], scaleY: [1, 1.02, 1] } : { y: 10, scaleY: 0.9 }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <div className="w-28 h-24 bg-gradient-to-b from-white to-orange-50 rounded-[45%] shadow-[inset_-5px_-5px_20px_rgba(0,0,0,0.05)] border border-white flex justify-center items-center">
          {status === 'active' ? (
            <div className="flex gap-4 mt-2">
              <div className="w-2.5 h-3.5 bg-gray-800 rounded-full relative overflow-hidden">
                 <motion.div className="w-1 h-1 bg-white rounded-full absolute top-0.5 right-0.5" animate={mousePos}/>
              </div>
              <div className="w-2.5 h-3.5 bg-gray-800 rounded-full relative overflow-hidden">
                 <motion.div className="w-1 h-1 bg-white rounded-full absolute top-0.5 right-0.5" animate={mousePos}/>
              </div>
            </div>
          ) : (
             <div className="flex gap-4 mt-4"><div className="w-3 h-1 bg-gray-400 rounded-full"></div><div className="w-3 h-1 bg-gray-400 rounded-full"></div></div>
          )}
        </div>
      </motion.div>

      {/* 🥣 碗的前壁 (半透明遮挡) */}
      <div className="absolute bottom-4 w-40 h-20 bg-white/60 backdrop-blur-[2px] rounded-b-[100px] border-t-2 border-white/80 z-30 pointer-events-none">
         {/* 光泽 */}
         <div className="absolute top-3 right-6 w-8 h-3 bg-white rounded-full opacity-50 rotate-[-15deg]"></div>
      </div>
      
    </div>
  )
}