// 匿名动物头像库
const ANIMALS = [
  { name: 'Deep Thinker', icon: '🦉', color: 'bg-slate-100 text-slate-600' },
  { name: 'Quiet Cat', icon: '🐱', color: 'bg-orange-50 text-orange-600' },
  { name: 'Busy Bee', icon: '🐝', color: 'bg-yellow-100 text-yellow-600' },
  { name: 'Happy Dog', icon: '🐶', color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Lazy Koala', icon: '🐨', color: 'bg-gray-100 text-gray-600' },
  { name: 'Cool Fox', icon: '🦊', color: 'bg-red-50 text-red-600' },
  { name: 'Soft Bunny', icon: '🐰', color: 'bg-pink-50 text-pink-600' },
]

export const getAnonymousIdentity = (userId: string) => {
  // 利用用户ID的字符编码之和来取模，保证同一个用户永远对应同一个动物
  let sum = 0
  for (let i = 0; i < userId.length; i++) {
    sum += userId.charCodeAt(i)
  }
  const index = sum % ANIMALS.length
  return ANIMALS[index]
}