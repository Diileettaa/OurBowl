'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MagicBar from '@/components/MagicBar'
import PetMochi from '@/components/PetMochi'
import { X, Maximize2, ArrowRight } from 'lucide-react'

// Emoji 映射
const moodEmojiMap: Record<string, string> = {
  'Joy': '🥰', 'Calm': '🌿', 'Neutral': '😶', 'Tired': '😴', 'Stressed': '🤯',
  'Angry': '🤬', 'Crying': '😭', 'Excited': '🎉', 'Sick': '🤢', 'Proud': '😎', 'Love': '❤️'
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [pet, setPet] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUser(user)
      
      const { data: petData } = await supabase.from('pet_states').select('*').eq('user_id', user.id).single()
      setPet(petData)
      
      // ✨ 关键修改：添加 .limit(5) 
      const { data: entryData } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      
      setEntries(entryData || [])
    }
    getData()
  }, [])

  if (!user) return null

  return (
    // 背景渐变
    <div className="min-h-screen bg-gradient-to-b from-[#FFFBEB] to-[#F1F5F9] pb-20 relative">
      
      {/* 图片查看器 */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"><X size={32}/></button>
          <img src={selectedImage} className="max-w-full max-h-[90vh] rounded shadow-2xl object-contain" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-28 relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Hello, Owner</h1>
            <p className="text-sm text-gray-400 font-medium mt-1 font-mono">{user.email}</p>
          </div>
          <Link href="/exploration" className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all border-2 border-[#FFFBEB]">
            🪐
          </Link>
        </div>

        {/* 宠物区域 */}
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-[32px] shadow-sm border border-white/60 mb-10 relative overflow-visible">
           <div className="flex justify-between items-center">
              <div>
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pet Status</div>
                 <h2 className="text-xl font-bold text-gray-800 mb-1">Mochi is Active</h2>
                 <p className="text-sm text-gray-400">Level 1 • Baby Phase</p>
                 <div className="flex gap-2 mt-4">
                    <span className="px-3 py-1 bg-orange-100/50 text-orange-500 text-xs font-bold rounded-full">LV.1 Baby</span>
                    <span className="px-3 py-1 bg-blue-100/50 text-blue-500 text-xs font-bold rounded-full">✨ Happy</span>
                 </div>
              </div>
              <div className="w-32 h-24 relative -mr-4 -mt-6">
                 {pet ? <PetMochi lastFedAt={pet.last_fed_at} /> : <div className="text-2xl">🥚</div>}
              </div>
           </div>
        </div>

        {/* 输入框 */}
        <div className="mb-12">
           <MagicBar />
        </div>

        {/* 列表 Header */}
        <div className="flex items-center justify-between mb-4 px-2">
           <div className="flex items-center gap-2 opacity-50">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent</span>
             <div className="h-px bg-gray-300 w-12"></div>
           </div>
           <Link href="/journey" className="text-[10px] font-bold text-gray-400 hover:text-gray-800 flex items-center gap-1 transition-colors">
             View All <ArrowRight size={12}/>
           </Link>
        </div>

        {/* ✨ 列表：完全复刻 Journey 的紧凑风格 ✨ */}
        <div className="space-y-3">
          {entries.map((entry) => {
             const lines = entry.content?.split('\n') || []
             const title = lines[0]?.length < 20 ? lines[0] : null
             const content = title ? lines.slice(1).join(' ') : entry.content
             const moodEmoji = moodEmojiMap[entry.mood] || null

             return (
              <div key={entry.id} className="bg-white p-3 rounded-xl border border-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex gap-3">
                
                {/* 左侧内容区 */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                           {/* Emoji */}
                           <span className="text-lg leading-none" title={entry.mood}>
                              {moodEmoji || <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{entry.mood}</span>}
                           </span>
                           {/* Tag */}
                           {entry.meal_type && entry.meal_type !== 'Life' && (
                             <span className="text-[10px] font-bold uppercase text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                               {entry.meal_type}
                             </span>
                           )}
                        </div>
                        {/* Time */}
                        <div className="text-[10px] text-gray-300 font-mono shrink-0">
                           {new Date(entry.created_at).toLocaleDateString()} • {new Date(entry.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </div>
                    </div>

                    {title && <h3 className="font-bold text-gray-800 text-sm mb-0.5 leading-tight truncate">{title}</h3>}
                    
                    <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-wrap line-clamp-2">
                      {content.replace('💭', '').trim()}
                    </p>
                </div>

                {/* 右侧图片区 */}
                {entry.image_url && (
                  <div 
                    className="w-20 h-20 shrink-0 rounded-lg bg-gray-50 overflow-hidden cursor-zoom-in border border-gray-100 relative group/img"
                    onClick={() => setSelectedImage(entry.image_url)}
                  >
                    <img src={entry.image_url} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                       <Maximize2 size={16} className="text-white drop-shadow-md" />
                    </div>
                  </div>
                )}
              </div>
             )
          })}

          {entries.length === 0 && (
            <div className="text-center py-12 text-gray-300 text-sm">
              No memories yet. Start recording!
            </div>
          )}
          
          {/* 底部按钮 */}
          {entries.length > 0 && (
             <Link href="/journey" className="block text-center text-xs text-gray-400 hover:text-gray-600 py-4 border-t border-dashed border-gray-200 mt-4">
               See full journey history &rarr;
             </Link>
          )}
        </div>

      </div>
    </div>
  )
}