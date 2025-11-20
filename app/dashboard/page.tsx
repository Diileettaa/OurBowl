'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MagicBar from '@/components/MagicBar'
import PetSection from '@/components/PetSection' // <--- 1. 引入新组件
import { X } from 'lucide-react'

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

      const { data: entryData } = await supabase.from('entries').select('*').order('created_at', { ascending: false })
      setEntries(entryData || [])
    }
    getData()
  }, [])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5EB] to-[#F5F7FA] pb-20 relative">
      
      {/* 图片查看器 */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white"><X size={32}/></button>
          <img src={selectedImage} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-8 relative z-10">
        
        {/* 顶部 Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Hello, Owner</h1>
            <p className="text-sm text-gray-400 font-medium mt-1 font-mono">{user.email}</p>
          </div>
          <Link href="/exploration" className="w-12 h-12 bg-[#2D2D2D] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all border-4 border-[#FFF5EB]">
            🪐
          </Link>
        </div>

        {/* 🌟 宠物区域：现在只需要这一行代码！🌟 */}
        {/* 以后不管你怎么改下面的列表，只要保留这行，宠物永远安全 */}
        <PetSection pet={pet} />

        {/* 输入框 */}
        <div className="mb-10 sticky top-6 z-40">
           <MagicBar />
        </div>

        {/* 列表标题 */}
        <div className="flex items-center justify-between mb-4 px-2 mt-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Memory Lane</h3>
          <span className="text-[10px] font-bold text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">Today</span>
        </div>

        {/* 列表内容 */}
        <div className="space-y-4">
          {entries.map((entry) => {
             const lines = entry.content?.split('\n') || []
             const title = lines[0] || 'Moment'
             const details = lines.slice(1).join(' ')
             const moodEmoji = moodEmojiMap[entry.mood] || null

             return (
              <div key={entry.id} className="bg-white p-5 rounded-[28px] shadow-sm border border-white/50 hover:shadow-md transition-all flex justify-between gap-4 group">
                <div className="flex-1 flex flex-col min-w-0">
                   <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide ${
                         entry.meal_type === 'Life' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {entry.meal_type || 'Note'}
                      </span>
                      <div className="text-lg filter grayscale-[0.3] group-hover:grayscale-0 transition-all">
                        {moodEmoji}
                      </div>
                   </div>
                   <h4 className="text-gray-800 font-bold text-lg truncate pr-2 mb-1">{title}</h4>
                   {details.replace('💭', '').trim() && (
                     <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3 font-medium">
                       {details.replace('💭', '').trim()}
                     </p>
                   )}
                   <div className="mt-auto text-[10px] text-gray-300 font-mono flex gap-2">
                      <span>{new Date(entry.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                </div>
                {entry.image_url && (
                  <div className="w-24 h-24 shrink-0 rounded-2xl bg-gray-100 overflow-hidden cursor-zoom-in relative shadow-inner border border-gray-100" onClick={() => setSelectedImage(entry.image_url)}>
                    <img src={entry.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                )}
              </div>
             )
          })}
          {entries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-300 text-sm">Waiting for your first story...</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}