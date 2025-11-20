import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ParkFeed from '@/components/ParkFeed' // 我们马上创建这个组件

export default async function ParkPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  // 获取所有公开的帖子 (关联查询 hugs 数量)
  const { data: posts } = await supabase
    .from('entries')
    .select('*, hugs(count)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#FDFCF8] pb-20">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 bg-[#FDFCF8]/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-[#8D99AE] flex items-center gap-2">
            🌳 The Park <span className="text-xs font-normal bg-green-100 text-green-600 px-2 py-1 rounded-full">Square</span>
          </h1>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
            Back Home
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* 顶部筛选器 (视觉展示) */}
        <div className="flex gap-3 overflow-x-auto pb-6 no-scrollbar">
          {['#DepressionHelp', '#DailyCheckIn', '#CatLovers', '#GymLife'].map(tag => (
            <span key={tag} className="px-4 py-2 bg-white border border-gray-100 rounded-full text-xs text-gray-500 whitespace-nowrap shadow-sm">
              {tag}
            </span>
          ))}
        </div>

        {/* 瀑布流帖子 */}
        <ParkFeed initialPosts={posts || []} userId={user.id} />
      </div>
    </div>
  )
}