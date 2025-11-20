'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MagicBar from '@/components/MagicBar'
import PetMochi from '@/components/PetMochi'
import { X, Maximize2 } from 'lucide-react'

// 情绪映射表 (用于在列表里把文字变回 Emoji)
const moodEmojiMap: Record<string, string> = {
  'Joy': '🥰', 'Calm': '🌿', 'Neutral': '😶', 'Tired': '😴', 'Stressed': '🤯',
  'Angry': '🤬', 'Crying': '😭', 'Excited': '🎉', 'Sick': '🤢', 'Proud': '😎', 'Love': '❤️'
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [pet, setPet] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null) // 控制图片放大
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setUser(user)

      // Fetch Pet
      const { data: petData } = await supabase.from('pet_states').select('*').eq('user_id', user.id).single()
      setPet(petData)

      // Fetch Entries
      const { data: entryData } = await supabase.from('entries').select('*').order('created_at', { ascending: false })
      setEntries(entryData || [])
    }
    getData()
  }, [])

  if (!user) return null

  return (
    // 1. 背景纹理：加上 radial-gradient 点缀，解决太白的问题
    <div className="min-h-screen bg-[#F5F7FA] pb-20 relative" 
         style={{ backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      
      {/* 顶部渐变遮罩，让头部文字清楚 */}
      <div className="fixed top-0 left-0 w-full h-32 bg-gradient-to-b from-[#F5F7FA] to-transparent pointer-events-none z-0"></div>

      {/* --- 图片全屏查看器 (Lightbox) --- */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white"><X size={32}/></button>
          <img src={selectedImage} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-8 relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Hello, Owner</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">{user.email}</p>
          </div>
          <Link href="/exploration" className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            🪐
          </Link>
        </div>

        {/* Pet Section */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[32px] shadow-clay-sm border border-white mb-8 flex items-center justify-between relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-200 to-orange-200"></div>
           <div className="z-10">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Companion</div>
              <h2 className="text-lg font-bold text-gray-800">Mochi is {pet ? 'Active' : '...'}</h2>
              <p className="text-xs text-gray-400">Level 1 • Growing</p>
           </div>
           <div className="w-24 h-20 -my-4 -mr-2">
              {pet && <PetMochi lastFedAt={pet.last_fed_at} />}
           </div>
        </div>

        {/* Input */}
        <div className="mb-10 sticky top-6 z-40">
           <MagicBar />
        </div>

        {/* List Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Recent</h3>
          <span className="text-[10px] font-bold text-gray-400 bg-white/50 px-2 py-1 rounded-md">Today</span>
        </div>

        {/* 🌟 列表 (List) - 紧凑布局，左图右文 */}
        <div className="space-y-3">
          {entries.map((entry) => {
             // 解析内容：第一行是标题(食物名)，后面是详情
             const lines = entry.content?.split('\n') || []
             const title = lines[0] || 'Moment'
             const details = lines.slice(1).join(' ')
             
             // 尝试获取 Emoji
             const moodEmoji = moodEmojiMap[entry.mood] || null

             return (
              <div key={entry.id} className="bg-white p-3 rounded-[20px] shadow-sm border border-gray-100 hover:shadow-md transition-all flex gap-4 group">
                
                {/* 左侧：图片 (如果有) */}
                {entry.image_url ? (
                  <div 
                    className="w-24 h-24 shrink-0 rounded-xl bg-gray-100 overflow-hidden cursor-zoom-in relative"
                    onClick={() => setSelectedImage(entry.image_url)}
                  >
                    <img src={entry.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                ) : (
                  // 如果没图，显示一个占位图标
                  <div className="w-24 h-24 shrink-0 rounded-xl bg-gray-50 flex items-center justify-center text-2xl text-gray-300">
                    {entry.meal_type === 'Life' ? '✨' : '🍽️'}
                  </div>
                )}

                {/* 右侧：内容区 */}
                <div className="flex-1 flex flex-col justify-center min-w-0 py-1">
                   <div className="flex justify-between items-start mb-1">
                      <div className="flex flex-col">
                         {/* 标签 */}
                         <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                               entry.meal_type === 'Life' ? 'bg-purple-50 text-purple-500' : 'bg-orange-50 text-orange-500'
                            }`}>
                              {entry.meal_type || 'Note'}
                            </span>
                            <span className="text-[10px] text-gray-300 font-mono">
                              {new Date(entry.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                         </div>
                         {/* 标题 (吃了啥) */}
                         <h4 className="text-gray-800 font-bold text-base truncate pr-2">{title}</h4>
                      </div>
                      
                      {/* 心情 (优先 Emoji) */}
                      <div className="text-xl" title={entry.mood}>
                        {moodEmoji || <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full text-gray-500">{entry.mood}</span>}
                      </div>
                   </div>

                   {/* 详情 (灰色小字) */}
                   <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                     {details.replace('💭', '').trim() || 'No details added.'}
                   </p>
                </div>

              </div>
             )
          })}

          {entries.length === 0 && (
            <div className="text-center py-10 text-gray-300 text-sm">No records yet.</div>
          )}
        </div>

      </div>
    </div>
  )
}