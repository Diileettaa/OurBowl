'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Send, Image as ImageIcon, Camera, X, Plus, Smile } from 'lucide-react'
import CameraModal from './CameraModal' // 引入刚才写的相机

export default function MagicBar() {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mood, setMood] = useState('')
  const [customMood, setCustomMood] = useState('')
  const [showOtherMoods, setShowOtherMoods] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  // 控制相机开关
  const [isCameraOpen, setIsCameraOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // 精致版情绪配置
  const mainMoods = [
    { label: 'Joy', emoji: '🌞', color: 'bg-orange-100 text-orange-600 border-orange-200' },
    { label: 'Calm', emoji: '🍃', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
    { label: 'Neutral', emoji: '☁️', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    { label: 'Tired', emoji: '💤', color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
  ]

  const otherMoods = [
    { label: 'Stressed', emoji: '🤯' },
    { label: 'Angry', emoji: '💢' },
    { label: 'Crying', emoji: '💧' },
    { label: 'Excited', emoji: '✨' },
    { label: 'Love', emoji: '❤️' },
  ]

  // 处理相册选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileObject(e.target.files[0])
    }
  }

  // 处理相机拍摄
  const handleCameraCapture = (capturedFile: File) => {
    setFileObject(capturedFile)
  }

  // 统一处理文件预览
  const setFileObject = (file: File) => {
    setFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!content.trim() && !mood && !customMood && !file) return alert('Empty?')
    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')

      let imageUrl = null
      if (file) {
        const fileExt = file.name.split('.').pop() || 'jpg'
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const { error: upErr } = await supabase.storage.from('memories').upload(fileName, file)
        if (upErr) throw upErr
        const { data: { publicUrl } } = supabase.storage.from('memories').getPublicUrl(fileName)
        imageUrl = publicUrl
      }

      const finalMood = customMood.trim() ? customMood : mood
      const { error } = await supabase.from('entries').insert({
        content, mood: finalMood, image_url: imageUrl, user_id: user.id
      })
      if (error) throw error

      await supabase.from('pet_states').update({ last_fed_at: new Date().toISOString() }).eq('user_id', user.id)
      
      window.location.reload()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* 相机弹窗 */}
      {isCameraOpen && (
        <CameraModal 
          onCapture={handleCameraCapture} 
          onClose={() => setIsCameraOpen(false)} 
        />
      )}

      {/* 主输入区域 - 悬浮卡片风格 */}
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl shadow-clay border border-white transition-all">
          
          {/* 1. 情绪胶囊 (更小、更精致) */}
          <div className="flex flex-wrap gap-2 mb-4">
            {mainMoods.map((m) => (
              <button
                key={m.label}
                onClick={() => { setMood(m.label); setCustomMood(''); }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  mood === m.label 
                  ? `${m.color} shadow-sm scale-105` 
                  : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">{m.emoji}</span> {m.label}
              </button>
            ))}
            <button
              onClick={() => setShowOtherMoods(!showOtherMoods)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1 ${
                showOtherMoods ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
              }`}
            >
              <Plus size={14} /> More
            </button>
          </div>

          {/* 扩展情绪 (滑出动画) */}
          {showOtherMoods && (
            <div className="mb-4 p-3 bg-gray-50/50 rounded-2xl border border-gray-100 animate-in slide-in-from-top-2">
              <div className="flex flex-wrap gap-2 mb-3">
                {otherMoods.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => { setMood(m.label); setCustomMood(''); }}
                    className={`px-3 py-1 rounded-xl text-xs border ${
                      mood === m.label ? 'bg-white border-purple-200 text-purple-600 shadow-sm' : 'border-transparent text-gray-500 hover:bg-white'
                    }`}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
              <input 
                type="text"
                placeholder="Type specific feeling..."
                value={customMood}
                onChange={(e) => { setCustomMood(e.target.value); setMood(''); }}
                className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-100"
              />
            </div>
          )}

          {/* 2. 文本输入 (去掉了那种大灰底，改得更像 Notion) */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening right now? ..."
            className="w-full min-h-[80px] bg-transparent text-base text-textMain placeholder-gray-300 focus:outline-none resize-none mb-2"
          />

          {/* 3. 图片预览 (更加圆润) */}
          {previewUrl && (
            <div className="relative w-fit mb-4">
              <img src={previewUrl} alt="Preview" className="h-24 rounded-2xl object-cover shadow-sm border border-white" />
              <button 
                onClick={() => { setFile(null); setPreviewUrl(null); }}
                className="absolute -top-2 -right-2 bg-white text-gray-500 p-1 rounded-full shadow-md hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* 4. 底部工具栏 (极简) */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <div className="flex gap-1">
              {/* 真正的相机按钮 */}
              <button 
                onClick={() => setIsCameraOpen(true)} 
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                title="Camera"
              >
                <Camera size={20} />
              </button>
              
              {/* 相册按钮 */}
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition-colors"
                title="Gallery"
              >
                <ImageIcon size={20} />
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primaryHover shadow-lg shadow-orange-100 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Saving...' : 'Record'} <Send size={14} />
            </button>
          </div>

        </div>
      </div>
    </>
  )
}