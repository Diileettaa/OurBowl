'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function PetMochi({ lastFedAt }: { lastFedAt: string }) {
  const [isHovered, setIsHovered] = useState(false)
  const [blink, setBlink] = useState(false)

  // 1. 眨眼逻辑 (随机眨眼，像活物)
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 200)
    }, Math.random() * 3000 + 2000) // 每2-5秒眨眼一次
    return () => clearInterval(interval)
  }, [])

  // 2. 状态计算
  const getStatus = () => {
    const lastFed = new Date(lastFedAt).getTime()
    const now = new Date().getTime()
    return (now - lastFed) / (1000 * 60 * 60) < 24 ? 'happy' : 'hungry'
  }
  const status = getStatus()

  return (
    <div className="relative flex flex-col items-center justify-center h-48 w-full">
      
      {/* 互动区域：把整个碗包起来 */}
      <motion.div 
        className="relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileTap={{ scale: 0.95, rotate: -5 }} // 点击时的 Q 弹效果
      >
        
        {/* ✨ 宠物本体 (Mochi) */}
        <motion.div
          className="relative z-10 w-28 h-24 mx-auto"
          animate={status === 'happy' ? {
            y: [0, -5, 0], // 呼吸浮动
            scaleY: [1, 1.05, 1], // 软体拉伸
          } : {
            y: 10, scaleY: 0.9 // 饿了就瘫着
          }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          {/* 身体：白色渐变，像棉花糖 */}
          <div className={`w-full h-full rounded-[45%] border-2 border-white/50 backdrop-blur-sm shadow-[inset_-10px_-5px_20px_rgba(0,0,0,0.05)] ${
            status === 'happy' 
              ? 'bg-gradient-to-b from-white to-orange-50' // 开心是暖色
              : 'bg-gradient-to-b from-gray-50 to-blue-50' // 饿了是冷色
          }`}>
            
            {/* 表情 (绝对定位在身体里) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
              {/* 眼睛 */}
              <div className="flex gap-5">
                <motion.div 
                  className="w-2 h-3 bg-gray-800 rounded-full"
                  animate={{ scaleY: blink ? 0.1 : 1 }} // 眨眼动画
                />
                <motion.div 
                  className="w-2 h-3 bg-gray-800 rounded-full"
                  animate={{ scaleY: blink ? 0.1 : 1 }}
                />
              </div>
              
              {/* 腮红 (开心时显示) */}
              {status === 'happy' && (
                <div className="w-full flex justify-between px-1 absolute top-2">
                  <div className="w-3 h-1.5 bg-pink-200 rounded-full blur-sm"></div>
                  <div className="w-3 h-1.5 bg-pink-200 rounded-full blur-sm"></div>
                </div>
              )}

              {/* 嘴巴 (SVG 画个微笑) */}
              {status === 'happy' ? (
                <svg width="14" height="8" viewBox="0 0 14 8" className="opacity-60">
                  <path d="M1 1C1 1 4 7 7 7C10 7 13 1 13 1" stroke="#374151" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
              ) : (
                <div className="w-2 h-1 bg-gray-400 rounded-full mt-1"></div> // 饿了抿嘴
              )}
            </div>
          </div>
        </motion.div>

        {/* 🥣 真实的碗 (分层渲染) */}
        <div className="relative -mt-8 z-20">
          {/* 碗口阴影 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-4 bg-black/10 blur-md rounded-[100%]"></div>
          
          {/* 碗体 */}
          <div className="w-40 h-16 bg-gradient-to-b from-white to-gray-100 border border-white rounded-b-[80px] shadow-clay relative overflow-hidden">
             {/* 碗上的光泽 */}
             <div className="absolute top-2 right-4 w-8 h-4 bg-white/80 rounded-full blur-sm rotate-[-20deg]"></div>
          </div>
        </div>

        {/* 互动气泡 (Hover 时才显示) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm border border-gray-100"
        >
          {status === 'happy' ? "Poke me! ✨" : "I'm hungry..."}
        </motion.div>

      </motion.div>
    </div>
  )
}