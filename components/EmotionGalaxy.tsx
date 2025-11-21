'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Stars, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { X, Calendar, Clock } from 'lucide-react' // 需要安装图标库

type Entry = {
  id: string
  content: string
  mood: string
  created_at: string
  image_url?: string
  meal_type?: string
}

// 颜色映射
const COLORS: Record<string, string> = {
  'Joy': '#FFD700',     // 金
  'Calm': '#00FFCC',    // 青
  'Neutral': '#FFFFFF', // 白
  'Tired': '#8A2BE2',   // 紫
  'Stressed': '#FF4500',// 橙
  'Angry': '#FF0000',   // 红
  'Crying': '#00BFFF',  // 蓝
  'Excited': '#FF1493', // 粉
  'Sick': '#32CD32',    // 绿
  'Proud': '#FF8C00',   // 深橙
  'Love': '#FF69B4'     // 桃红
}

// --- 1. 呼吸星球组件 ---
function PulsingPlanet({ entry, position, onClick }: { entry: Entry; position: [number, number, number]; onClick: (e: Entry) => void }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHover] = useState(false)
  const baseColor = COLORS[entry.mood] || '#FFFFFF'
  
  // 随机生成呼吸的频率和相位，让每个球不一样
  const randomSpeed = useMemo(() => 0.5 + Math.random() * 1.5, [])
  const randomOffset = useMemo(() => Math.random() * 100, [])

  useFrame((state) => {
    if (!meshRef.current) return
    
    // 呼吸逻辑：利用 Sin 函数实现一张一缩
    const t = state.clock.getElapsedTime()
    const breathe = Math.sin(t * randomSpeed + randomOffset) * 0.15 // 呼吸幅度
    const baseScale = hovered ? 1.8 : 1.2 // 悬停时变大
    
    // 平滑应用缩放
    const targetScale = baseScale + breathe
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1))
    
    // 缓慢自转
    meshRef.current.rotation.y += 0.01
    meshRef.current.rotation.z += 0.005
  })

  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(entry) }} // 阻止事件穿透
        onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true) }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false) }}
      >
        {/* 使用二十面体，晶莹剔透 */}
        <icosahedronGeometry args={[0.4, 1]} /> 
        <meshPhysicalMaterial 
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={hovered ? 3 : 1.5} // 悬停时超亮
          roughness={0}
          metalness={0.2}
          transmission={0.8} // 玻璃透明感
          thickness={2}
        />
      </mesh>
      
      {/* 内部微光核心 (暗示里面有东西) */}
      <mesh scale={[0.5, 0.5, 0.5]}>
         <sphereGeometry args={[0.4, 16, 16]} />
         <meshBasicMaterial color="white" opacity={0.5} transparent />
      </mesh>
    </group>
  )
}

// --- 2. 详情弹窗 (HTML Overlay) ---
function DetailModal({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  if (!entry) return null
  
  const color = COLORS[entry.mood] || '#FFFFFF'
  
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[32px] max-w-sm w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()} // 防止点击卡片关闭
        style={{ boxShadow: `0 0 40px ${color}40` }} // 动态光晕
      >
        {/* 装饰背景光 */}
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: color }}></div>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
          <X size={24} />
        </button>

        {/* 顶部信息 */}
        <div className="flex items-center gap-3 mb-4">
           <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg" style={{ background: color }}>
              {/* 简单的 Emoji 映射，你可以用你之前的 map */}
              {entry.mood === 'Joy' ? '🥰' : '✨'}
           </div>
           <div>
              <h3 className="text-white font-bold text-lg">{entry.mood} Moment</h3>
              <div className="flex items-center gap-2 text-xs text-white/60 font-mono">
                 <Calendar size={12} />
                 <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                 <Clock size={12} />
                 <span>{new Date(entry.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
           </div>
        </div>

        {/* 图片 */}
        {entry.image_url && (
          <div className="rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-inner">
            <img src={entry.image_url} className="w-full h-48 object-cover" />
          </div>
        )}

        {/* 内容 */}
        <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
           {entry.meal_type && (
             <span className="inline-block px-2 py-0.5 bg-white/10 rounded-md text-[10px] text-white/80 mb-2 uppercase tracking-wider">
               {entry.meal_type}
             </span>
           )}
           <p className="text-white/90 leading-relaxed font-medium whitespace-pre-wrap">
             {entry.content}
           </p>
        </div>

      </div>
    </div>
  )
}

// --- 3. 主组件 ---
export default function EmotionGalaxy({ entries, filter }: { entries: Entry[], filter: string | null }) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)

  // 筛选数据
  const filteredEntries = useMemo(() => {
    if (!filter) return entries
    return entries.filter(e => e.mood === filter)
  }, [entries, filter])

  // ✨ 斐波那契球体算法 (Fibonacci Sphere) ✨
  // 让所有点均匀分布在一个球体表面
  const positions = useMemo(() => {
    const count = filteredEntries.length
    const phi = Math.PI * (3 - Math.sqrt(5)) // 黄金角度

    return filteredEntries.map((_, i) => {
      const y = 1 - (i / (count - 1)) * 2 // y 从 1 到 -1
      const radius = Math.sqrt(1 - y * y) // 半径
      const theta = phi * i // 黄金角度螺旋

      const r = 8 // 球体总半径 (宇宙大小)
      
      return [
        Math.cos(theta) * radius * r,
        y * r,
        Math.sin(theta) * radius * r
      ] as [number, number, number]
    })
  }, [filteredEntries])

  const universeColor = filter ? (COLORS[filter] || 'white') : 'white'

  return (
    <div className="w-full h-full bg-black relative">
      
      {/* 弹窗层 */}
      {selectedEntry && <DetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}

      <Canvas camera={{ position: [0, 0, 18], fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={['#020205']} />
        <fog attach="fog" args={['#020205', 15, 50]} />

        {/* 特效 */}
        {/* @ts-ignore */}
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.5} mipmapBlur intensity={2.0} radius={0.3} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={1} color={universeColor} />

        {/* 粒子背景 */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
        <Sparkles count={100} scale={10} size={2} speed={0.2} opacity={0.3} color={universeColor} />

        {/* 核心：旋转的记忆球体 */}
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
          <group rotation={[0, 0, Math.PI / 4]}> {/* 整体倾斜一点，更好看 */}
             {filteredEntries.map((entry, i) => (
                <PulsingPlanet 
                  key={entry.id} 
                  entry={entry} 
                  position={positions[i]} 
                  onClick={setSelectedEntry} // 传递点击事件
                />
             ))}
          </group>
        </Float>

        <OrbitControls 
          enableZoom={true} 
          enablePan={false} 
          autoRotate={!selectedEntry} // 没打开弹窗时自动旋转
          autoRotateSpeed={0.8}
          maxDistance={40}
          minDistance={5}
        />
      </Canvas>
    </div>
  )
}