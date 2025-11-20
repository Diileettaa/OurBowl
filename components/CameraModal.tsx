'use client'

import { useRef, useState, useEffect } from 'react'
import { X, RefreshCw } from 'lucide-react'

interface CameraModalProps {
  onCapture: (file: File) => void
  onClose: () => void
}

export default function CameraModal({ onCapture, onClose }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')

  // 启动相机
  useEffect(() => {
    let stream: MediaStream | null = null
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: facingMode,
            aspectRatio: 3/4 // 竖屏比例
          }
        })
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch (err) {
        console.error("Camera Error:", err)
        onClose()
      }
    }
    startCamera()
    return () => stream?.getTracks().forEach(t => t.stop())
  }, [facingMode, onClose])

  // 拍照
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
      }
      ctx.drawImage(video, 0, 0)
      canvas.toBlob(blob => {
        if (blob) onCapture(new File([blob], "photo.jpg", { type: "image/jpeg" }))
        onClose()
      }, 'image/jpeg', 0.9)
    }
  }

  return (
    // 1. 背景层：半透明模糊
    <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      
      {/* 2. 弹窗卡片：白色圆角 */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* 顶部：视频区域 */}
        <div className="relative aspect-[3/4] bg-black">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} 
          />
          
          {/* 关闭按钮 (悬浮在视频右上角) */}
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/30 text-white rounded-full backdrop-blur-md hover:bg-black/50 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* 底部：白色控制栏 */}
        <div className="p-6 flex items-center justify-around bg-white">
          {/* 翻转按钮 */}
          <button onClick={() => setFacingMode(p => p === 'user' ? 'environment' : 'user')} 
            className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-all">
            <RefreshCw size={22} />
          </button>

          {/* 拍照按钮 (快门) */}
          <button onClick={takePhoto} className="p-1 border-4 border-primary/30 rounded-full active:scale-95 transition-transform">
            <div className="w-16 h-16 bg-primary rounded-full shadow-lg hover:bg-primaryHover transition-colors"></div>
          </button>

          {/* 占位，保持对称 */}
          <div className="w-12"></div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}