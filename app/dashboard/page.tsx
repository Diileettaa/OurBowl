import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MagicBar from '@/components/MagicBar'
import PetMochi from '@/components/PetMochi'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/')
  }

  // 获取宠物数据
  const { data: pet } = await supabase
    .from('pet_states')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // 获取日记数据
  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#FDFCF8] p-8">
      <div className="max-w-2xl mx-auto">
        
        {/* 顶部：Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#8D99AE] mb-1">
              Welcome Home
            </h1>
            <p className="text-gray-400 text-sm font-mono">{user.email}</p>
          </div>
          {/* 星球按钮 */}
          <Link 
            href="/exploration"
            className="px-5 py-2 bg-black text-white rounded-full hover:scale-105 transition-all shadow-lg flex items-center gap-2 text-sm font-bold"
          >
            🪐 Galaxy &rarr;
          </Link>
        </div>

        {/* 🏠 共养面板 (现在变成了去社区的按钮！) */}
        <Link href="/park">
          <div className="bg-gradient-to-br from-[#FF9A9E] to-[#FECFEF] p-6 rounded-[32px] shadow-lg mb-8 text-white relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  🌳 Enter Community
                </h2>
                <p className="text-white/90 text-xs mt-1">
                  Click here to visit The Park
                </p>
              </div>
              <div className="flex -space-x-3 opacity-80">
                <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-lg">😎</div>
                <div className="w-10 h-10 rounded-full bg-black/20 border-2 border-white/50 flex items-center justify-center text-lg grayscale">🐱</div>
              </div>
            </div>

            {/* 这是一个假的进度条，用于展示未来功能 */}
            <div className="mt-6">
               <div className="flex justify-between text-xs mb-2 opacity-90">
                 <span>Community Love (Demo)</span>
                 <span>85%</span>
               </div>
               <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                 <div className="w-[85%] h-full bg-white rounded-full"></div>
               </div>
            </div>
          </div>
        </Link>

        {/* 🌟 宠物区域 🌟 */}
        <div className="mb-8">
          {pet ? (
            <PetMochi lastFedAt={pet.last_fed_at} />
          ) : (
            <div className="text-center text-gray-300 py-4 bg-gray-50 rounded-2xl">
              Run SQL to adopt a pet...
            </div>
          )}
        </div>
        
        {/* 输入框 */}
        <div className="mb-12 sticky top-6 z-50">
           <MagicBar />
        </div>

        {/* 日记列表 */}
        <div className="space-y-6 pb-20">
          <div className="flex items-center gap-2 ml-2 mb-4 opacity-50">
             <div className="h-px bg-gray-200 flex-1"></div>
             <span className="text-xs font-mono text-gray-400">TIMELINE</span>
             <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {entries && entries.length > 0 ? (
            entries.map((entry) => (
              <div key={entry.id} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-all">
                 {/* 头部信息 */}
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        entry.mood === 'joy' ? 'bg-yellow-400' : 'bg-green-400'
                      }`}></div>
                      <span className="text-xs font-bold text-gray-500 uppercase">{entry.mood}</span>
                    </div>
                    <span className="text-xs text-gray-300 font-mono">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                 </div>

                 {/* 内容 */}
                 <p className="text-gray-700">{entry.content}</p>
                 
                 {/* 图片展示 */}
                 {entry.image_url && (
                   <img src={entry.image_url} className="rounded-xl w-full h-48 object-cover border border-gray-100" />
                 )}
              </div>
            ))
          ) : (
            <div className="text-center py-20 opacity-30">
              <p>Write your first memory...</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}