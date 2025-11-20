'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Send, Camera, Image as ImageIcon, X, Plus, Utensils, Sparkles, ChevronUp } from 'lucide-react' // 引入餐具和闪光图标
import CameraModal from './CameraModal'

export default function MagicBar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // ✨ 新增：模式切换 ('food' | 'life')
  const [recordMode, setRecordMode] = useState<'food' | 'life'>('food')
  
  const [content, setContent] = useState('')
  const [foodContent, setFoodContent] = useState('')
  const [mood, setMood] = useState('')
  const [mealType, setMealType] = useState('')
  const [customMood, setCustomMood] = useState('')
  const [showOtherMoods, setShowOtherMoods] = useState(false)
  
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isPublic, setIsPublic] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const meals = [
    { label: 'Breakfast', icon: '🍳' },
    { label: 'Lunch', icon: '🍱' },
    { label: 'Dinner', icon: '🍷' },
    { label: 'Snack', icon: '🍪' },
    { label: 'Coffee', icon: '☕' },
  ]

  const mainMoods = [
    { label: 'Joy', emoji: '🥰', color: 'bg-orange-50 border-orange-200' },
    { label: 'Calm', emoji: '🌿', color: 'bg-emerald-50 border-emerald-200' },
    { label: 'Neutral', emoji: '😶', color: 'bg-slate-50 border-slate-200' },
    { label: 'Tired', emoji: '😴', color: 'bg-indigo-50 border-indigo-200' },
    { label: 'Stressed', emoji: '🤯', color: 'bg-rose-50 border-rose-200' },
  ]

  const otherMoods = [
    { label: 'Angry', emoji: '🤬' },
    { label: 'Crying', emoji: '😭' },
    { label: 'Excited', emoji: '🎉' },
    { label: 'Sick', emoji: '🤢' },
    { label: 'Proud', emoji: '😎' },
  ]

  // --- 逻辑部分保持不变 ---
  const handleFocus = () => setIsExpanded(true)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFileObject(e.target.files[0])
  }
  const handleCameraCapture = (file: File) => setFileObject(file)
  const setFileObject = (file: File) => {
    setFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setIsExpanded(true)
  }

  const handleSubmit = async () => {
    if (!foodContent && !content && !file) return
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let imageUrl = null
      if (file) {
        const fileName = `${user.id}/${Date.now()}.${file.name.split('.').pop()}`
        await supabase.storage.from('memories').upload(fileName, file)
        const { data } = supabase.storage.from('memories').getPublicUrl(fileName)
        imageUrl = data.publicUrl
      }

      // 组合内容：如果是生活模式，直接存 content；如果是饮食模式，组合 food + content
      let finalContent = content
      if (recordMode === 'food' && foodContent) {
        finalContent = `${foodContent}\n\n💭 ${content}`
      }

      const finalMood = customMood.trim() ? customMood : mood
      
      await supabase.from('entries').insert({
        content: finalContent,
        mood: finalMood, 
        image_url: imageUrl, 
        user_id: user.id,
        is_public: isPublic,
        meal_type: recordMode === 'food' ? mealType : 'Life' // 生活模式标记为 Life
      })

      await supabase.from('pet_states').update({ last_fed_at: new Date().toISOString() }).eq('user_id', user.id)
      window.location.reload()
    } catch (e) {
      alert('Error')
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {isCameraOpen && <CameraModal onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}

      <div className="w-full max-w-2xl mx-auto relative">
        
        {/* 主卡片 */}
        <div className={`bg-white rounded-[24px] shadow-clay border border-white transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'p-5' : 'p-3'}`}>
          
          {/* 收起状态 */}
          {!isExpanded && (
            <div className="flex items-center gap-3">
               <button onClick={() => setIsCameraOpen(true)} className="p-3 bg-gray-50 text-gray-500 rounded-2xl hover:bg-blue-50 hover:text-blue-500">
                 <Camera size={20} />
               </button>
               <div onClick={handleFocus} className="flex-1 h-12 bg-gray-50 rounded-2xl flex items-center px-4 text-gray-400 cursor-text text-sm font-medium">
                 {recordMode === 'food' ? "What did you eat?" : "Record your life..."}
               </div>
               {/* 收起状态下的小切换钮 */}
               <button 
                 onClick={() => setRecordMode(recordMode === 'food' ? 'life' : 'food')}
                 className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl"
               >
                 {recordMode === 'food' ? <Utensils size={20}/> : <Sparkles size={20}/>}
               </button>
            </div>
          )}

          {/* 展开状态 */}
          {isExpanded && (
            <div className="flex gap-4">
              
              {/* 左侧：主要表单区 */}
              <div className="flex-1 space-y-5 animate-in fade-in">
                
                {/* 顶部 Header */}
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                     {recordMode === 'food' ? 'Food Log' : 'Life Log'}
                   </span>
                   <button onClick={() => setIsExpanded(false)} className="p-1 text-gray-300 hover:bg-gray-50 rounded-full"><ChevronUp size={16}/></button>
                </div>

                {/* 图片预览 */}
                {previewUrl && (
                  <div className="relative w-full h-40 rounded-2xl overflow-hidden">
                    <img src={previewUrl} className="w-full h-full object-cover" />
                    <button onClick={() => {setFile(null); setPreviewUrl(null)}} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"><X size={14}/></button>
                  </div>
                )}

                {/* 🍴 只有在 Food 模式下显示餐点选择 */}
                {recordMode === 'food' && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {meals.map(m => (
                      <button
                        key={m.label}
                        onClick={() => setMealType(mealType === m.label ? '' : m.label)}
                        className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          mealType === m.label ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-100'
                        }`}
                      >
                        {m.icon} {m.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* 输入框区域 (根据模式变化) */}
                <div className="space-y-3">
                  {recordMode === 'food' && (
                    <input 
                      autoFocus
                      value={foodContent}
                      onChange={e => setFoodContent(e.target.value)}
                      placeholder="I ate..."
                      className="w-full text-xl font-bold text-gray-800 placeholder-gray-300 outline-none bg-transparent"
                    />
                  )}
                  <textarea 
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder={recordMode === 'food' ? "Add details... (calories, etc)" : "What happened today?"}
                    className={`w-full text-sm text-gray-600 placeholder-gray-300 outline-none bg-transparent resize-none ${recordMode === 'life' ? 'h-32 text-lg' : 'h-16'}`}
                  />
                </div>

                {/* 心情选择 (去掉了 grayscale) */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {mainMoods.map(m => (
                    <button
                      key={m.label}
                      onClick={() => setMood(m.label)}
                      className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                        mood === m.label 
                        ? 'bg-white border-gray-800 shadow-md scale-105' // 选中态
                        : 'bg-gray-50 border-transparent text-gray-500 hover:bg-white hover:border-gray-200' // 默认态 (彩色emoji)
                      }`}
                    >
                      <span className="text-lg">{m.emoji}</span>
                      {m.label}
                    </button>
                  ))}
                  <button onClick={() => setShowOtherMoods(!showOtherMoods)} className="px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-400">
                    +
                  </button>
                </div>
                
                {/* 更多心情面板 */}
                {showOtherMoods && (
                   <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-2xl">
                      {otherMoods.map(m => (
                        <button key={m.label} onClick={() => {setMood(m.label); setCustomMood('')}} className="px-3 py-1 bg-white rounded-lg text-xs border border-gray-100 shadow-sm">
                          {m.emoji} {m.label}
                        </button>
                      ))}
                      <input 
                        placeholder="Custom..." 
                        value={customMood} 
                        onChange={e => setCustomMood(e.target.value)}
                        className="flex-1 px-2 bg-transparent text-xs outline-none min-w-[60px]" 
                      />
                   </div>
                )}

                {/* 底部按钮 */}
                <div className="flex items-center justify-between pt-2">
                   <div className="flex gap-2">
                      <button onClick={() => setIsCameraOpen(true)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl"><Camera size={20}/></button>
                      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden"/>
                      <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl"><ImageIcon size={20}/></button>
                   </div>
                   <button 
                     onClick={handleSubmit}
                     disabled={isSubmitting}
                     className="bg-[#F5C066] hover:bg-[#E0A845] text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-orange-100 transition-all active:scale-95"
                   >
                     {isSubmitting ? 'Saving...' : 'Save'}
                   </button>
                </div>

              </div>

              {/* 👉 右侧：模式切换栏 (Sidebar) */}
              <div className="w-12 flex flex-col gap-2 pt-8">
                 <button 
                   onClick={() => setRecordMode('food')}
                   className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                     recordMode === 'food' 
                     ? 'bg-black text-white shadow-lg scale-110' 
                     : 'bg-gray-50 text-gray-300 hover:bg-gray-100'
                   }`}
                   title="Food Mode"
                 >
                   <Utensils size={18} />
                 </button>
                 <button 
                   onClick={() => setRecordMode('life')}
                   className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                     recordMode === 'life' 
                     ? 'bg-purple-500 text-white shadow-lg scale-110' 
                     : 'bg-gray-50 text-gray-300 hover:bg-gray-100'
                   }`}
                   title="Life Mode"
                 >
                   <Sparkles size={18} />
                 </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  )
}