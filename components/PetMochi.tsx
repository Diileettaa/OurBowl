'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

export default function PetMochi({ lastFedAt }: { lastFedAt: string }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const getStatus = () => {
    const lastFed = new Date(lastFedAt).getTime()
    const now = new Date().getTime()
    return (now - lastFed) / (1000 * 60 * 60) < 24 ? 'active' : 'sleep'
  }
  const status = getStatus()

  // 眼神跟随逻辑
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      // 限制眼球移动范围
      const x = (e.clientX - (rect.left + rect.width / 2)) / 12
      const y = (e.clientY - (rect.top + rect.height / 2)) / 12
      setMousePos({ x, y })
    }
    if (status === 'active') window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [status])

  return (
    <div ref={containerRef} className="relative flex flex-col items-center justify-end w-56 h-48 mx-auto shrink-0 z-10">
      
      {/* --- 1. 碗的后壁 (Back Wall) --- */}
      <div 
        className="absolute bottom-0 w-48 h-24 rounded-b-[100px] z-0"
        style={{
          background: '#F3F4F6',
          border: '3px solid #FFFFFF',
          boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.05)'
        }}
      ></div>

      {/* --- 2. 团子本体 (THE SOUL) --- */}
      <motion.div
        className="relative z-10 mb-8 cursor-pointer origin-bottom"
        initial={false}
        animate={status === 'active' ? {
          y: [0, -8, 0], 
          scaleY: [1, 1.05, 0.98, 1],
        } : {
          y: 15, scaleY: 0.9
        }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9, rotate: -5 }}
      >
        {/* 身体：强制使用内联样式，保证质感 */}
        <div 
          className="w-36 h-32 rounded-[48%] flex justify-center items-center relative"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #ffffff, #fef3c7)', // 奶黄渐变
            boxShadow: 'inset -10px -10px 20px rgba(255, 200, 100, 0.1), 0 10px 25px rgba(0,0,0,0.1)', // 柔光阴影
            border: '2px solid rgba(255,255,255,0.8)',
            backdropFilter: 'blur(4px)'
          }}
        >
          
          {/* 表情区域 */}
          <div className="relative top-2 flex flex-col items-center">
            {status === 'active' ? (
              <>
                {/* 眼睛容器 */}
                <div className="flex gap-8">
                  {/* 左眼 */}
                  <div className="w-3.5 h-4.5 bg-gray-800 rounded-full relative overflow-hidden">
                     {/* 高光眼珠 */}
                     <motion.div 
                       className="w-1.5 h-1.5 bg-white rounded-full absolute top-1 left-1"
                       animate={{ x: mousePos.x, y: mousePos.y }}
                     />
                  </div>
                  {/* 右眼 */}
                  <div className="w-3.5 h-4.5 bg-gray-800 rounded-full relative overflow-hidden">
                     <motion.div 
                       className="w-1.5 h-1.5 bg-white rounded-full absolute top-1 left-1"
                       animate={{ x: mousePos.x, y: mousePos.y }}
                     />
                  </div>
                </div>

                {/* 腮红 (强制粉色光晕) */}
                <div className="absolute -left-4 top-4 w-6 h-3 rounded-full"
                     style={{ background: '#FFB6C1', filter: 'blur(6px)', opacity: 0.8 }}></div>
                <div className="absolute -right-4 top-4 w-6 h-3 rounded-full"
                     style={{ background: '#FFB6C1', filter: 'blur(6px)', opacity: 0.8 }}></div>

                {/* 嘴巴 (微笑) */}
                <div className="w-3 h-1.5 border-b-2 border-gray-400 rounded-full mt-1"></div>
              </>
            ) : (
              // 睡着状态
              <div className="flex flex-col items-center">
                 <div className="flex gap-8 opacity-50">
                    <div className="w-4 h-1 bg-gray-500 rounded-full"></div>
                    <div className="w-4 h-1 bg-gray-500 rounded-full"></div>
                 </div>
                 <div className="mt-2 text-blue-300 text-xs font-bold animate-pulse">Zzz...</div>
              </div>
            )}
          </div>

        </div>
      </motion.div>

      {/* --- 3. 碗的前壁 (Front Glass) --- */}
      <div 
        className="absolute bottom-0 w-48 h-24 rounded-b-[100px] z-20 pointer-events-none"
        style={{
          background: 'rgba(255, 255, 255, 0.4)', // 半透明玻璃
          borderTop: '2px solid rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(2px)'
        }}
      >
         {/* 碗上的高光反射 */}
         <div className="absolute top-3 right-8 w-12 h-4 bg-white rounded-full opacity-40 rotate-[-15deg] blur-[2px]"></div>
      </div>
      
    </div>
  )
}