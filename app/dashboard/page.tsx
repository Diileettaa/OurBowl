import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MagicBar from '@/components/MagicBar'
import PetMochi from '@/components/PetMochi' // <--- 1. Import Pet

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/')
  }

  // 2. Fetch Pet Data (Fetch the pet status)
  const { data: pet } = await supabase
    .from('pet_states')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // 3. Fetch Entries
  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#FDFCF8] p-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-3xl font-bold text-[#8D99AE] mb-1">
              Welcome Home
            </h1>
            <p className="text-gray-400 text-sm font-mono">{user.email}</p>
          </div>
          <Link 
            href="/exploration"
            className="px-5 py-2 bg-black text-white rounded-full hover:scale-105 transition-all shadow-lg flex items-center gap-2 text-sm font-bold"
          >
            🪐 Galaxy &rarr;
          </Link>
        </div>

        {/* === 新增：共养面板 (Co-Op Panel) === */}
        <div className="bg-gradient-to-br from-[#FF9A9E] to-[#FECFEF] p-6 rounded-[32px] shadow-lg mb-8 text-white relative overflow-hidden group">
          {/* 装饰背景 */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                🏠 Our Little Home
              </h2>
              <p className="text-white/80 text-xs mt-1">You & Your Partner</p>
            </div>
            <div className="flex -space-x-3">
              {/* 你的头像 */}
              <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-lg">😎</div>
              {/* 伴侣头像 (灰色占位) */}
              <div className="w-10 h-10 rounded-full bg-black/20 border-2 border-white/50 flex items-center justify-center text-lg grayscale">🐱</div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mt-6">
             <div className="flex justify-between text-xs mb-2 opacity-90">
               <span>Weekly Love</span>
               <span>85%</span>
             </div>
             <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
               <div className="w-[85%] h-full bg-white rounded-full"></div>
             </div>
          </div>
        </div>

        {/* 🌟 THE PET SECTION 🌟 */}
        <div className="mb-8">
          {pet ? (
            <PetMochi lastFedAt={pet.last_fed_at} />
          ) : (
            <div className="text-center text-gray-300">Loading Pet...</div>
          )}
        </div>
        
        {/* Input */}
        <div className="mb-12 sticky top-6 z-50">
           <MagicBar />
        </div>

        {/* Timeline */}
        <div className="space-y-6 pb-20">
          <div className="flex items-center gap-2 ml-2 mb-4 opacity-50">
             <div className="h-px bg-gray-200 flex-1"></div>
             <span className="text-xs font-mono text-gray-400">TIMELINE</span>
             <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {entries && entries.length > 0 ? (
            entries.map((entry) => (
              // 找到这个 div (大约在 80 行左右)
<div key={entry.id} className="bg-white/80 backdrop-blur p-6 rounded-3xl shadow-clay-sm border border-white flex flex-col gap-4 hover:-translate-y-1 transition-all duration-300">
                
                {/* Top: Header with Mood & Time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Mood Badge (Color or Emoji) */}
                    <span className="px-3 py-1 bg-gray-50 rounded-full text-sm font-medium text-gray-600 border border-gray-100">
                      {/* Simple logic to show emoji if available, else color dot */}
                      {['Joy','Calm','Neutral','Tired','Stressed','Angry','Crying','Excited'].some(m => entry.mood?.includes(m)) 
                        ? entry.mood // It's a standard mood name
                        : `🏷️ ${entry.mood || 'Unknown'}` // It's a custom mood
                      }
                    </span>
                  </div>
                  <span className="text-xs text-gray-300 font-mono">
                    {new Date(entry.created_at).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>

                {/* Middle: Text Content */}
                {entry.content && (
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {entry.content}
                  </p>
                )}

                {/* ✨ NEW: Image Display ✨ */}
                {entry.image_url && (
                  <div className="mt-2 rounded-2xl overflow-hidden border border-gray-100">
                    <img 
                      src={entry.image_url} 
                      alt="Memory" 
                      className="w-full h-auto max-h-[400px] object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                
              </div>
            ))
          ) : (
            <div className="text-center py-20 opacity-30">
              <p>No memories yet...</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}