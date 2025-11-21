'use client'

import { useState } from 'react'
import { Heart, MoreHorizontal } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import { getAnonymousIdentity } from '@/utils/getAnonymousIdentity'
import { motion } from 'framer-motion'

export default function ParkFeed({ initialPosts, currentUserId }: { initialPosts: any[], currentUserId: string }) {
  const [posts, setPosts] = useState(initialPosts)
  // 记录用户刚刚点击了哪些赞 (用于本地即时反馈)
  const [huggingIds, setHuggingIds] = useState<Set<string>>(new Set())

  const handleHug = async (entryId: string, isAlreadyHugged: boolean) => {
    // 1. 乐观更新 (不等服务器，直接变色)
    const newPosts = posts.map(p => {
      if (p.id === entryId) {
        const currentCount = p.hugs[0]?.count || 0
        // 如果这篇帖子当前用户已经抱过了，那就是取消；否则是增加
        // 这里为了简化 MVP，我们假设 initialPosts 里还没包含"我是否点赞"的信息
        // 我们只做简单的 +1 动画演示
        return { ...p, tempHugged: true, hugs: [{ count: currentCount + 1 }] }
      }
      return p
    })
    setPosts(newPosts)
    setHuggingIds(prev => new Set(prev).add(entryId))

    // 2. 发送请求给数据库
    await supabase.from('hugs').insert({ entry_id: entryId, user_id: currentUserId })
  }

  return (
    // 瀑布流/网格布局
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {posts.map((post) => {
        const identity = getAnonymousIdentity(post.user_id)
        const hugCount = post.hugs[0]?.count || 0
        const isJustHugged = huggingIds.has(post.id)

        return (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col gap-4"
          >
            {/* 头部：匿名身份 */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${identity.color}`}>
                  {identity.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700">{identity.name}</p>
                  <p className="text-xs text-gray-400 font-mono">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {/* 心情标签 */}
              <span className="text-[10px] font-bold bg-gray-50 px-2 py-1 rounded text-gray-400 uppercase">
                {post.mood}
              </span>
            </div>

            {/* 内容 */}
            <div>
               <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                 {post.content}
               </p>
               {post.image_url && (
                 <div className="mt-3 rounded-xl overflow-hidden aspect-video bg-gray-50">
                    <img src={post.image_url} className="w-full h-full object-cover" />
                 </div>
               )}
            </div>

            {/* 底部：互动栏 */}
            <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
               {/* 这是一个占位菜单，以后可以做举报功能 */}
               <button className="text-gray-300 hover:text-gray-500"><MoreHorizontal size={16}/></button>

               {/* 抱抱按钮 */}
               <button 
                 onClick={() => handleHug(post.id, false)}
                 disabled={isJustHugged} // 点过一次暂时锁住，防止狂点
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all active:scale-90 ${
                    isJustHugged 
                    ? 'bg-pink-50 text-pink-500' 
                    : 'bg-gray-50 text-gray-400 hover:bg-pink-50 hover:text-pink-400'
                 }`}
               >
                 <Heart size={16} fill={isJustHugged ? "currentColor" : "none"} className={isJustHugged ? "animate-bounce" : ""} />
                 <span className="text-xs font-bold">{hugCount}</span>
               </button>
            </div>

          </motion.div>
        )
      })}

      {posts.length === 0 && (
         <div className="col-span-full text-center py-20 opacity-50">
            <p className="text-gray-400">The park is quiet today...</p>
         </div>
      )}
    </div>
  )
}