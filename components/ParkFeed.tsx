'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'

// 匿名动物库
const ANIMALS = [
  { name: 'Anxious Rabbit', icon: '🐰' },
  { name: 'Happy Otter', icon: '🦦' },
  { name: 'Sleepy Koala', icon: '🐨' },
  { name: 'Wise Owl', icon: '🦉' },
  { name: 'Brave Lion', icon: '🦁' },
  { name: 'Chill Capybara', icon: '🥔' },
]

// 根据用户ID生成固定的随机动物 (这样同一个人发的贴头像一样)
const getAvatar = (id: string) => {
  const index = id.charCodeAt(0) % ANIMALS.length
  return ANIMALS[index]
}

export default function ParkFeed({ initialPosts, userId }: { initialPosts: any[], userId: string }) {
  const [posts, setPosts] = useState(initialPosts)
  const [huggedPosts, setHuggedPosts] = useState<Set<string>>(new Set())

  const handleHug = async (entryId: string) => {
    if (huggedPosts.has(entryId)) return // 已经抱过了
    
    // 1. 乐观更新 UI (立刻变红)
    setHuggedPosts(prev => new Set(prev).add(entryId))
    setPosts(current => 
      current.map(p => p.id === entryId ? { ...p, hugs: [{ count: (p.hugs[0]?.count || 0) + 1 }] } : p)
    )

    // 2. 发送请求
    await supabase.from('hugs').insert({ entry_id: entryId, user_id: userId })
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const avatar = getAvatar(post.user_id)
        const isHugged = huggedPosts.has(post.id)
        const hugCount = post.hugs[0]?.count || 0

        return (
          // 鹅卵石形状卡片
          <div key={post.id} className="bg-white p-6 rounded-[32px] rounded-tl-none shadow-clay-sm border border-white hover:-translate-y-1 transition-all duration-300">
            
            {/* 头部：匿名信息 */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-xl">
                {avatar.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-600">{avatar.name}</p>
                <p className="text-xs text-gray-300">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
              {/* 心情标签 */}
              <span className="ml-auto text-xs bg-gray-50 px-3 py-1 rounded-full text-gray-400">
                {post.mood}
              </span>
            </div>

            {/* 内容 */}
            <p className="text-gray-700 leading-relaxed mb-4">
              {post.content}
            </p>
            {post.image_url && (
               <img src={post.image_url} className="w-full h-48 object-cover rounded-2xl mb-4 opacity-90" />
            )}

            {/* 底部：抱抱按钮 */}
            <div className="flex justify-end">
              <button 
                onClick={() => handleHug(post.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  isHugged 
                    ? 'bg-pink-50 text-pink-500' 
                    : 'bg-gray-50 text-gray-400 hover:bg-pink-50 hover:text-pink-400'
                }`}
              >
                <Heart size={18} fill={isHugged ? "currentColor" : "none"} />
                <span className="text-xs font-bold">{hugCount} Hugs</span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}