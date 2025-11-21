'use client'

import { supabase } from '@/utils/supabase/client' // <--- 1. 改成引入 supabase
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import EmotionGalaxy from '@/components/EmotionGalaxy'
import { useEffect, useState } from 'react'
import { ArrowLeft, Filter } from 'lucide-react'

// ... (MOODS 常量保持不变，省略以节省空间) ...
const MOODS = [
  { name: 'Joy', emoji: '🥰', color: 'bg-yellow-500' },
  { name: 'Calm', emoji: '🌿', color: 'bg-emerald-500' },
  { name: 'Tired', emoji: '😴', color: 'bg-indigo-500' },
  { name: 'Stressed', emoji: '🤯', color: 'bg-red-500' },
  { name: 'Sad', emoji: '💧', color: 'bg-blue-500' },
]

export default function ExplorationPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [filter, setFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  // ❌ 删掉 const supabase = createClient() 这一行，因为我们上面已经直接引入了

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false })
      
      setEntries(data || [])
      setLoading(false)
    }
    getData()
  }, [])

  // ... (下面的 return 代码完全保持不变) ...
  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative flex flex-col">
      {/* ... 保持原来的 UI 代码 ... */}
      
      {/* 1. 顶部悬浮栏 */}
      <div className="absolute top-0 left-0 w-full z-20 p-6 flex justify-between items-start pointer-events-none">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            {filter ? `${filter} Universe` : 'MEMORY GALAXY'}
          </h1>
          <p className="text-white/50 text-xs font-mono mt-2 uppercase tracking-[0.3em]">
            {entries.length} Memories Found
          </p>
        </div>

        <Link 
          href="/dashboard"
          className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white font-bold transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={18} /> Back
        </Link>
      </div>

      {/* 2. 底部筛选器 (HUD) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 max-w-[90vw] pointer-events-auto">
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl overflow-x-auto no-scrollbar">
          
          {/* 全部按钮 */}
          <button
            onClick={() => setFilter(null)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              filter === null 
              ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.5)]' 
              : 'text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            All Stars
          </button>

          <div className="w-px h-6 bg-white/10"></div>

          {/* 情绪按钮 */}
          {MOODS.map((m) => (
            <button
              key={m.name}
              onClick={() => setFilter(filter === m.name ? null : m.name)}
              className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all border ${
                filter === m.name
                ? 'bg-white/10 border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-lg filter drop-shadow-lg">{m.emoji}</span>
              <span className="text-xs font-bold uppercase">{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. 核心 3D 舞台 */}
      <div className="absolute inset-0 z-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-white/30 font-mono animate-pulse">
            Loading Galaxy...
          </div>
        ) : (
          <EmotionGalaxy entries={entries} filter={filter} />
        )}
      </div>
    </div>
  )
}