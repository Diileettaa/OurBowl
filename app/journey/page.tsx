import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'

// 情绪颜色映射 (更高级的莫兰迪色)
const moodColorMap: Record<string, string> = {
  'Joy': 'bg-yellow-400', 
  'Calm': 'bg-emerald-400', 
  'Neutral': 'bg-gray-300', 
  'Tired': 'bg-indigo-300', 
  'Stressed': 'bg-rose-400',
  'Angry': 'bg-red-500',
  'Crying': 'bg-blue-400',
  'Excited': 'bg-pink-400',
  'Sick': 'bg-green-600',
  'Proud': 'bg-orange-400',
  'Love': 'bg-red-400'
}

export default async function JourneyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // 获取所有数据
  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Journey</h1>
              <p className="text-gray-500 text-sm mt-1">{entries?.length || 0} memories collected</p>
            </div>
          </div>
        </div>

        {/* ⏳ 核心：时间轴列表 */}
        <div className="relative border-l-2 border-gray-100 ml-4 md:ml-8 space-y-12 pb-20">
          
          {entries?.map((entry) => {
            const date = new Date(entry.created_at)
            const moodColor = moodColorMap[entry.mood] || 'bg-gray-300'
            
            return (
              <div key={entry.id} className="relative pl-8 md:pl-12 group">
                
                {/* 1. 时间轴上的点 (Dot) */}
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${moodColor} group-hover:scale-125 transition-transform`}></div>

                {/* 2. 内容卡片 (Card) */}
                <div className="flex flex-col gap-1">
                  
                  {/* 日期头 */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <Calendar size={12} />
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs text-gray-300 font-mono flex items-center gap-1">
                      <Clock size={12} />
                      {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {/* 心情标签 */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${moodColor} bg-opacity-20 text-gray-600`}>
                      {entry.mood}
                    </span>
                  </div>

                  {/* 主内容卡片 */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all">
                    
                    {/* 图片 */}
                    {entry.image_url && (
                      <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
                        <img src={entry.image_url} className="w-full max-h-96 object-cover" />
                      </div>
                    )}

                    {/* 文字 */}
                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                      {entry.content}
                    </div>

                    {/* 底部标签 */}
                    {entry.meal_type && entry.meal_type !== 'Life' && (
                      <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2">
                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                          {entry.meal_type}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )
          })}

          {(!entries || entries.length === 0) && (
            <div className="pl-8 text-gray-400 italic">Journey begins here...</div>
          )}

        </div>
      </div>
    </div>
  )
}