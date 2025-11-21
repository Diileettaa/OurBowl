import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ParkFeed from '@/components/ParkFeed'

export default async function ParkPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  // 获取所有【公开】的帖子 (is_public = true)
  // 并获取每个帖子的抱抱数量
  const { data: posts } = await supabase
    .from('entries')
    .select('*, hugs(count)') 
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50) // 只拿最新的50条

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-50 bg-[#FAFAFA]/80 backdrop-blur-md border-b border-gray-100">
         <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
                <ArrowLeft size={18} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-800">The Park</h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Anonymous Community</p>
              </div>
            </div>
            
            <div className="flex gap-2">
               {/* 这里以后可以放筛选器 */}
               <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-500">
                 Latest
               </span>
            </div>
         </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-2xl mx-auto px-4 pt-6">
        
        {/* 欢迎横幅 */}
        <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-[32px] border border-green-100 text-center">
           <div className="text-4xl mb-2">🌳</div>
           <h2 className="text-green-800 font-bold mb-1">Share your warmth</h2>
           <p className="text-green-600/70 text-xs max-w-xs mx-auto">
             Posts here are anonymous. Give a hug to support others.
           </p>
        </div>

        {/* 帖子流组件 */}
        <ParkFeed initialPosts={posts || []} currentUserId={user.id} />

      </div>
    </div>
  )
}