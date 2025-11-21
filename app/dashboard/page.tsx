'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MagicBar from '@/components/MagicBar'
import PetMochi from '@/components/PetMochi'
import { X, ArrowRight } from 'lucide-react'

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

      // ✨ 关键修改：只取前 5 条 (limit 5)
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
    // 1. 背景：高级灰白，极简风格
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] pb-20">
      
      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-8 right-8 text-gray-400 hover:text-gray-900"><X size={32}/></button>
          <img src={selectedImage} className="max-w-full max-h-full rounded shadow-2xl object-contain" />
        </div>
      )}

      <div className="max-w-xl mx-auto px-6 pt-12">
        
        {/* Header: 极简纯文字，去掉了图标装饰 */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Hello, {user.email?.split('@')[0]}
            </h1>
            <p className="text-gray-400 text-sm mt-1">What's happening today?</p>
          </div>
          <Link href="/exploration" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg hover:border-gray-400 transition-all">
            🪐
          </Link>
        </div>

        {/* 🌟 宠物区：去掉了背景卡片，让它成为页面的一部分 */}
        <div className="flex flex-col items-center justify-center mb-10 -mt-4">
           <div className="scale-110">
              {pet ? <PetMochi lastFedAt={pet.last_fed_at} /> : <div className="text-4xl opacity-20">🥚</div>}
           </div>
        </div>

        {/* 输入框 */}
        <div className="mb-16 sticky top-6 z-40">
           <MagicBar />
        </div>

        {/* 列表区域 */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Activity</h3>
            <Link href="/journey" className="text-xs font-medium text-gray-500 hover:text-black flex items-center gap-1 transition-colors">
              View All <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-6">
            {entries.map((entry) => {
               const lines = entry.content?.split('\n') || []
               const title = lines[0] || 'Moment'
               const details = lines.slice(1).join(' ')

               return (
                <div key={entry.id} className="group flex gap-5 items-start">
                  
                  {/* 左侧时间轴线 */}
                  <div className="flex flex-col items-center pt-1 gap-1">
                     <div className="w-2 h-2 rounded-full bg-gray-200 group-hover:bg-gray-800 transition-colors"></div>
                     <div className="w-px h-full bg-gray-100"></div>
                  </div>

                  {/* 右侧内容：极简卡片 */}
                  <div className="flex-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-default">
                     <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-gray-800 text-lg line-clamp-1">{title}</h4>
                        <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                          {new Date(entry.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </span>
                     </div>

                     {details.replace('💭', '').trim() && (
                       <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
                         {details.replace('💭', '').trim()}
                       </p>
                     )}

                     {/* 图片 */}
                     {entry.image_url && (
                       <div 
                         className="w-full h-40 bg-gray-50 rounded-xl overflow-hidden cursor-zoom-in relative border border-gray-100"
                         onClick={() => setSelectedImage(entry.image_url)}
                       >
                         <img src={entry.image_url} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                       </div>
                     )}
                     
                     {/* 底部：标签 */}
                     <div className="mt-4 flex gap-2">
                        <span className="text-[10px] font-bold uppercase text-gray-400 border border-gray-100 px-2 py-0.5 rounded">
                          {entry.mood}
                        </span>
                        {entry.meal_type && entry.meal_type !== 'Life' && (
                          <span className="text-[10px] font-bold uppercase text-gray-400 border border-gray-100 px-2 py-0.5 rounded">
                            {entry.meal_type}
                          </span>
                        )}
                     </div>
                  </div>
                </div>
               )
            })}
          </div>

          {/* 底部大按钮 */}
          <Link href="/journey" className="block w-full py-4 text-center text-sm font-medium text-gray-400 hover:text-gray-800 hover:bg-gray-50 rounded-2xl transition-all border border-dashed border-gray-200">
            View Full Journey History
          </Link>

        </div>
      </div>
    </div>
  )
}