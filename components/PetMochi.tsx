'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

export default function PetMochi({ lastFedAt }: { lastFedAt: string }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // 1. 状态判断
  const getStatus = () => {
    const lastFed = new Date(lastFedAt).getTime()
    const now = new Date().getTime()
    // 24小时内算开心，超过算饿
    return (now - lastFed) / (1000 * 60 * 60) < 24 ? 'active' : 'hungry'
  }
  const status = getStatus()

  // 2. 眼神跟随逻辑 (修复版：更灵敏，不会消失)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      // 获取团子在屏幕上的中心点
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      // 计算鼠标距离中心的偏移量，除以一个系数来限制眼球转动幅度
      const x = (e.clientX - centerX) / 15
      const y = (e.clientY - centerY) / 15
      setMousePos({ x, y })
    }
    if (status === 'active') window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [status])

  // 3. 点击互动：冒爱心
  const handleTap = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const newHeart = { id: Date.now(), x, y }
    setHearts((prev) => [...prev, newHeart])
    
    // 1秒后清理爱心
    setTimeout(() => {
      setHearts((prev) => prev.filter(h => h.id !== newHeart.id))
    }, 1000)
  }

  return (
    // 🛡️ 金钟罩：这里定义了 w-60 h-52，它永远占这么多空间，不会被挤压
    <div ref={containerRef} className="relative w-60 h-52 flex items-end justify-center shrink-0 select-none">
      
      {/* --- 1. 冒爱心特效层 (最上层) --- */}
      <AnimatePresence>
        {hearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 1, y: h.y - 50, x: h.x }}
            animate={{ opacity: 0, y: h.y - 150 }}
            exit={{ opacity: 0 }}
            className="absolute z-50 text-2xl pointer-events-none"
            style={{ left: 0, top: 0 }} //定位基准
          >
            ❤️
          </motion.div>
        ))}
      </AnimatePresence>

      {/* --- 2. 碗的后壁 (Back Wall) --- */}
      <div 
        className="absolute bottom-0 w-48 h-24 rounded-b-[100px] z-0"
        style={{
          background: '#F3F4F6',
          border: '3px solid #FFFFFF',
          boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.05)' // 内部阴影，增加深度
        }}
      ></div>

      {/* --- 3. 团子本体 (THE SOUL) --- */}
      <motion.div
        className="relative z-10 mb-6 cursor-pointer origin-bottom"
        onClick={handleTap}
        initial={false}
        animate={status === 'active' ? {
          y: [0, -6, 0], // 呼吸浮动
          scaleY: [1, 1.05, 0.98, 1], // 软体弹性
        } : {
          y: 12, scaleY: 0.9, scaleX: 1.1 // 饿了瘫软变扁
        }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9, rotate: [0, -5, 5, 0] }} // 点击时抖动
      >
        {/* 身体材质：不仅是颜色，还有光泽 */}
        <div 
          className="w-32 h-28 rounded-[46%] flex justify-center items-center relative"
          style={{
            background: 'radial-gradient(70% 70% at 30% 30%, #FFFFFF 0%, #FFF7ED 100%)', // 更加温润的奶白色
            boxShadow: 'inset -5px -5px 15px rgba(200, 150, 100, 0.1), 0 10px 20px rgba(0,0,0,0.05)', // 立体感阴影
            border: '2px solid rgba(255,255,255,0.8)', // 淡淡的轮廓光
          }}
        >
          
          {/* 表情区域 */}
          <div className="relative top-3 flex flex-col items-center">
            {status === 'active' ? (
              <>
                {/* 眼睛容器 */}
                <div className="flex gap-8">
                  {/* 左眼 */}
                  <div className="w-3.5 h-4.5 bg-[#2D3748] rounded-full relative overflow-hidden">
                     {/* 高光眼珠 (跟随鼠标) */}
                     <motion.div 
                       className="w-1.5 h-1.5 bg-white rounded-full absolute top-0.5 left-0.5"
                       animate={{ x: mousePos.x, y: mousePos.y }}
                     />
                  </div>
                  {/* 右眼 */}
                  <div className="w-3.5 h-4.5 bg-[#2D3748] rounded-full relative overflow-hidden">
                     <motion.div 
                       className="w-1.5 h-1.5 bg-white rounded-full absolute top-0.5 left-0.5"
                       animate={{ x: mousePos.x, y: mousePos.y }}
                     />
                  </div>
                </div>

                {/* 腮红 (调深一点颜色，防止看不见) */}
                <div className="absolute -left-3 top-4 w-5 h-2.5 rounded-full bg-[#FFB6C1] opacity-60 blur-[2px]"></div>
                <div className="absolute -right-3 top-4 w-5 h-2.5 rounded-full bg-[#FFB6C1] opacity-60 blur-[2px]"></div>

                {/* 嘴巴 (微笑) */}
                <div className="w-3 h-1.5 border-b-2 border-[#2D3748] rounded-full mt-1 opacity-60"></div>
              </>
            ) : (
              // 睡着/饿了状态
              <div className="flex flex-col items-center">
                 {/* 闭着的眼睛 */}
                 <div className="flex gap-8 opacity-60">
                    <div className="w-4 h-0.5 bg-[#2D3748] rounded-full"></div>
                    <div className="w-4 h-0.5 bg-[#2D3748] rounded-full"></div>
                 </div>
                 {/* 鼻涕泡 */}
                 <motion.div 
                    className="absolute -right-4 -top-2 w-6 h-6 bg-blue-100/60 rounded-full border border-blue-200"
                    animate={{ scale: [0.8, 1.2, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                 />
                 <div className="mt-3 text-xs font-bold text-gray-300 tracking-widest">HUNGRY</div>
              </div>
            )}
          </div>

        </div>
      </motion.div>

      {/* --- 4. 碗的前壁 (Front Glass) --- */}
      {/* 用 z-20 盖住团子下半身，产生沉浸感 */}
      <div 
        className="absolute bottom-0 w-48 h-24 rounded-b-[100px] z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.8))', // 更有质感的玻璃
          borderTop: '1px solid rgba(255,255,255,0.8)',
          backdropFilter: 'blur(3px)' // 增加一点点模糊
        }}
      >
         {/* 碗上的高光反射 */}
         <div className="absolute top-4 right-8 w-10 h-3 bg-white rounded-full opacity-50 rotate-[-20deg] blur-[1px]"></div>
      </div>
      
      {/* 底部投影 */}
      <div className="absolute -bottom-4 w-32 h-4 bg-black/5 blur-md rounded-[100%] z-[-1]"></div>

    </div>
  )
}