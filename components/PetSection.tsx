'use client'

import PetMochi from './PetMochi'

// 这个组件专门负责：
// 1. 决定显示宠物还是显示蛋
// 2. 控制宠物在页面上的位置和大小
// 3. 保护宠物不受主页面其他 CSS 的干扰

export default function PetSection({ pet }: { pet: any }) {
  return (
    // 这里的 className 负责定位，保证它永远居中，并且底部留出空间给输入框
    <div className="w-full flex justify-center relative z-0 -mb-12">
      
      {/* 这是一个保护层，限制最大宽度，防止被拉伸 */}
      <div className="relative w-full max-w-md flex justify-center items-end h-56">
        
        {/* 如果有宠物数据，显示 Mochi；如果没有，显示蛋 */}
        {pet ? (
          // scale-110 让它稍微大一点，origin-bottom 保证它是从底部变大，不会飘起来
          <div className="transform scale-110 origin-bottom transition-transform duration-500 hover:scale-115">
             <PetMochi lastFedAt={pet.last_fed_at} />
          </div>
        ) : (
          // 待领养状态 (蛋)
          <div className="flex flex-col items-center justify-center opacity-60 animate-pulse pb-10">
             <div className="text-6xl mb-2">🥚</div>
             <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">Waiting...</p>
          </div>
        )}

      </div>
    </div>
  )
}