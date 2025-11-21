'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Stars, Sparkles, Line } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { X, Calendar, Clock } from 'lucide-react'

type Entry = {
  id: string
  content: string
  mood: string
  created_at: string
  image_url?: string
  meal_type?: string
}

const COLORS: Record<string, string> = {
  'Joy': '#FFD700', 'Calm': '#00FFCC', 'Neutral': '#FFFFFF', 'Tired': '#8A2BE2',
  'Stressed': '#FF4500', 'Angry': '#FF0000', 'Crying': '#00BFFF', 'Excited': '#FF1493',
  'Sick': '#32CD32', 'Proud': '#FF8C00', 'Love': '#FF69B4'
}

// --- 1. 极细微连线组件 ---
function Connections({ positions, color }: { positions: THREE.Vector3[], color: string }) {
  const lines = useMemo(() => {
    const points: THREE.Vector3[] = []
    // 只连接最近的邻居，减少线条数量
    for (let i = 0; i < positions.length; i++) {
      if (i + 1 < positions.length) {
        points.push(positions[i])
        points.push(positions[i + 1])
      }
    }
    return points
  }, [positions])

  return (
    <Line
      points={lines}
      color={color}
      opacity={0.03} // ✨ 极度微弱，只有 3% 的不透明度，像呼吸一样若隐若现
      transparent
      lineWidth={0.5} // 线条变细
      segments
    />
  )
}

// --- 2. 拥有光影逻辑的星球 ---
function GravityPlanet({ 
  entry, 
  originalPos, 
  isSelected, 
  isAnySelected, 
  onClick 
}: { 
  entry: Entry; 
  originalPos: [number, number, number]; 
  isSelected: boolean; 
  isAnySelected: boolean;
  onClick: (e: Entry) => void 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHover] = useState(false)
  const baseColor = COLORS[entry.mood] || '#FFFFFF'
  
  // 随机参数
  const randomSpeed = useMemo(() => 0.5 + Math.random() * 1.5, [])
  const randomOffset = useMemo(() => Math.random() * 100, [])

  useFrame((state) => {
    if (!meshRef.current) return
    
    // --- 1. 目标位置计算 ---
    let targetPos = new THREE.Vector3(...originalPos)
    let targetScale = 1.0

    if (isAnySelected) {
      if (isSelected) {
        // ✨ 选中状态：飞到 (0, 1, 10)
        // 不再贴脸 (Z=12)，稍微远一点 (Z=10)，且稍微靠上 (Y=1)，不挡住卡片
        targetPos.set(0, 1.5, 10) 
        // ✨ 选中大小：不再变巨大 (2.5)，稍微变大一点点 (1.3) 作为点缀
        targetScale = 1.3 
      } else {
        // 配角：被吸入深处，变成背景星尘
        targetPos.multiplyScalar(0.2) 
        targetScale = 0.3 // 变得很小
      }
    } else {
      // 默认状态：稍微大一点点方便点击
      if (hovered) targetScale = 1.2
    }

    // --- 2. 呼吸动画 ---
    const t = state.clock.getElapsedTime()
    const breathe = Math.sin(t * randomSpeed + randomOffset) * 0.05
    
    // --- 3. 移动插值 ---
    meshRef.current.position.lerp(targetPos, 0.08) // 移动稍微慢一点，更优雅
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale + breathe, 0.1))
    meshRef.current.rotation.y += 0.005
  })

  // --- 4. 动态光亮度计算 (核心需求) ---
  const getEmissiveIntensity = () => {
    if (isSelected) return 4.0 // ✨ 选中：爆亮！
    if (isAnySelected) return 0.1 // 别人被选中：我变暗淡
    if (hovered) return 2.0 // 悬停：稍微亮一点
    return 0.6 // ✨ 平时：比较暗，像沉睡的宝石
  }

  return (
    <mesh 
      ref={meshRef}
      onClick={(e) => { e.stopPropagation(); onClick(entry) }}
      onPointerOver={() => { if(!isAnySelected) { document.body.style.cursor = 'pointer'; setHover(true) } }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false) }}
    >
      <icosahedronGeometry args={[0.5, 1]} /> 
      <meshPhysicalMaterial 
        color={baseColor}
        emissive={baseColor}
        emissiveIntensity={getEmissiveIntensity()} // 动态光强
        roughness={0.1}
        metalness={0.1}
        transmission={0.6}
        thickness={1.5}
        transparent
        opacity={isAnySelected && !isSelected ? 0.2 : 0.9} // 没选中时变得很透明
      />
    </mesh>
  )
}

// --- 3. 详情弹窗 ---
function DetailModal({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  const color = COLORS[entry.mood] || '#FFFFFF'
  
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div 
        className="pointer-events-auto bg-black/40 backdrop-blur-2xl border border-white/10 p-6 rounded-[32px] max-w-sm w-full mx-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden animate-in zoom-in-95 duration-500 slide-in-from-bottom-5"
        style={{ borderTop: `1px solid ${color}60` }} // 只有顶部有一点点颜色暗示
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white p-2 transition-colors">
          <X size={20} />
        </button>

        {/* 头部 */}
        <div className="flex items-center gap-4 mb-5">
           <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-white/5 shadow-inner">
              {entry.mood === 'Joy' ? '🥰' : '✨'}
           </div>
           <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-bold text-xl tracking-wide">{entry.mood}</span>
                {entry.meal_type && (
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-md text-white/60 uppercase tracking-wider">
                    {entry.meal_type}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-white/30 font-mono">
                 <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(entry.created_at).toLocaleDateString()}</span>
                 <span className="flex items-center gap-1"><Clock size={10} /> {new Date(entry.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
              </div>
           </div>
        </div>

        {/* 图片 */}
        {entry.image_url && (
          <div className="rounded-2xl overflow-hidden mb-5 border border-white/5 shadow-lg relative aspect-video">
            <img src={entry.image_url} className="w-full h-full object-cover opacity-90" />
          </div>
        )}

        {/* 文字 */}
        <p className="text-white/80 leading-relaxed font-medium text-base whitespace-pre-wrap">
           {entry.content}
        </p>

      </div>
    </div>
  )
}

// --- 4. 主组件 ---
export default function EmotionGalaxy({ entries, filter }: { entries: Entry[], filter: string | null }) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)

  const filteredEntries = useMemo(() => {
    if (!filter) return entries
    return entries.filter(e => e.mood === filter)
  }, [entries, filter])

  // 斐波那契球体坐标
  const positions = useMemo(() => {
    const count = filteredEntries.length
    const phi = Math.PI * (3 - Math.sqrt(5))
    const r = 10 

    return filteredEntries.map((_, i) => {
      const y = 1 - (i / (count - 1)) * 2
      const radius = Math.sqrt(1 - y * y)
      const theta = phi * i
      return new THREE.Vector3(
        Math.cos(theta) * radius * r,
        y * r,
        Math.sin(theta) * radius * r
      )
    })
  }, [filteredEntries])

  const posArray = useMemo(() => positions.map(p => [p.x, p.y, p.z] as [number, number, number]), [positions])
  const universeColor = filter ? (COLORS[filter] || 'white') : 'white'

  return (
    <div className="w-full h-full bg-black relative">
      
      {selectedEntry && <DetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}

      <Canvas camera={{ position: [0, 0, 24], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={['#020205']} />
        <fog attach="fog" args={['#020205', 20, 60]} />

        {/* @ts-ignore */}
        <EffectComposer disableNormalPass>
          {/* 降低 Bloom 阈值，增强发光对比度 */}
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.2} radius={0.6} />
        </EffectComposer>

        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={1} color={universeColor} />

        <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={0.5} />
        <Sparkles count={150} scale={15} size={3} speed={0.2} opacity={0.3} color={universeColor} />

        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
          <group>
             {/* 线条只在没选中时显示，且非常淡 */}
             {!selectedEntry && (
                <Connections positions={positions} color={universeColor} />
             )}

             {filteredEntries.map((entry, i) => (
                <GravityPlanet 
                  key={entry.id} 
                  entry={entry} 
                  originalPos={posArray[i]}
                  isSelected={selectedEntry?.id === entry.id}
                  isAnySelected={!!selectedEntry}
                  onClick={setSelectedEntry}
                />
             ))}
          </group>
        </Float>

        <OrbitControls 
          enableZoom={!selectedEntry} 
          enablePan={false} 
          autoRotate={!selectedEntry} 
          autoRotateSpeed={0.5}
          maxDistance={50}
          minDistance={5}
        />
      </Canvas>
    </div>
  )
}