'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Float, Stars, Line, Sparkles, Billboard } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

type Entry = {
  id: string
  content: string
  mood: string
  created_at: string
}

// 颜色配置 (荧光色)
const COLORS: Record<string, string> = {
  'Joy': '#FFD700',     // 金色
  'Calm': '#00FFCC',    // 青色
  'Neutral': '#A0A0A0', // 银白
  'Tired': '#8A2BE2',   // 紫色
  'Stressed': '#FF4500',// 橙红
  'Angry': '#FF0000',   // 纯红
  'Crying': '#00BFFF',  // 深蓝
  'Excited': '#FF1493', // 荧光粉
  'Sick': '#32CD32',    // 毒液绿
  'Proud': '#FF8C00',   // 深橙
  'Love': '#FF69B4'     // 粉红
}

// 1. 超级星球组件 (玻璃水晶质感 + 发光)
function Planet({ entry, position, isSelected }: { entry: Entry; position: [number, number, number], isSelected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHover] = useState(false)
  
  const baseColor = COLORS[entry.mood] || '#FFFFFF'

  useFrame((state) => {
    if (!meshRef.current) return
    // 自转
    meshRef.current.rotation.y += 0.005
    meshRef.current.rotation.z += 0.002
    
    // 呼吸效果 (选中时跳动)
    const t = state.clock.getElapsedTime()
    const scaleBase = hovered ? 1.5 : 1
    const breathe = Math.sin(t * 2 + position[0]) * 0.1
    const targetScale = scaleBase + breathe
    
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1))
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <group position={position}>
        <mesh 
          ref={meshRef}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
        >
          {/* 使用二十面体，更有晶体感 */}
          <icosahedronGeometry args={[0.6, 2]} /> 
          {/* 物理材质：像发光的水晶 */}
          <meshPhysicalMaterial 
            color={baseColor}
            emissive={baseColor} // 自发光
            emissiveIntensity={hovered ? 2.5 : 1.2} // 悬停时更亮
            roughness={0.1}
            metalness={0.1}
            transmission={0.6} // 半透明玻璃感
            thickness={1}
          />
        </mesh>
        
        {/* 文字标签 (始终面向屏幕) */}
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <Text
            position={[0, -1.2, 0]}
            fontSize={hovered ? 0.5 : 0.35}
            color={baseColor}
            anchorX="center"
            anchorY="middle"
            maxWidth={4}
            outlineWidth={0.02}
            outlineColor="#000000"
            fillOpacity={hovered ? 1 : 0.7}
          >
            {entry.content.slice(0, 12) + (entry.content.length > 12 ? '...' : '')}
          </Text>
        </Billboard>
      </group>
    </Float>
  )
}

// 2. 星座连线 (只连接筛选后的点)
function Constellations({ positions, color }: { positions: [number, number, number][], color: string }) {
  const points = useMemo(() => {
    // 简单的连线逻辑：把所有点串起来
    const p: THREE.Vector3[] = []
    positions.forEach(pos => {
      p.push(new THREE.Vector3(...pos))
    })
    return p
  }, [positions])

  if (points.length < 2) return null

  return (
    <Line
      points={points}
      color={color}
      opacity={0.2}
      transparent
      lineWidth={1.5} // 稍微粗一点
    />
  )
}

// 3. 主组件
export default function EmotionGalaxy({ entries, filter }: { entries: Entry[], filter: string | null }) {
  
  // 根据筛选器过滤数据
  const filteredEntries = useMemo(() => {
    if (!filter) return entries
    return entries.filter(e => e.mood === filter)
  }, [entries, filter])

  // 计算坐标 (使用螺旋算法，让宇宙更漂亮)
  const positions = useMemo(() => {
    return filteredEntries.map((_, i) => {
      const angle = i * 0.5 // 螺旋角度
      const radius = 2 + i * 0.8 // 扩散半径
      // 加入随机扰动，让它看起来自然
      return [
        Math.cos(angle) * radius + (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 6, // Y轴高度差
        Math.sin(angle) * radius + (Math.random() - 0.5) * 2
      ] as [number, number, number]
    })
  }, [filteredEntries])

  // 决定整个宇宙的主色调
  const universeColor = filter ? (COLORS[filter] || 'white') : 'white'

  return (
    <div className="w-full h-full bg-black relative animate-in fade-in duration-1000">
      <Canvas camera={{ position: [0, 2, 20], fov: 45 }} dpr={[1, 2]}>
        {/* 宇宙背景色 */}
        <color attach="background" args={['#020205']} />
        <fog attach="fog" args={['#020205', 10, 40]} />

        {/* ✨ 后期处理特效 (让星球发光！) */}
        <EffectComposer disableNormalPass>
          {/* Bloom: 发光特效 */}
          <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.4} />
          {/* Vignette: 暗角，增加电影感 */}
          
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        {/* 灯光 */}
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color={universeColor} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="blue" />

        {/* 🌟 环境粒子 */}
        <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={200} scale={12} size={4} speed={0.4} opacity={0.5} color={universeColor} />

        {/* 🪐 渲染星球 */}
        <group>
          {filteredEntries.map((entry, i) => (
            <Planet 
              key={entry.id} 
              entry={entry} 
              position={positions[i]} 
              isSelected={!!filter}
            />
          ))}
          
          {/* 连线 */}
          <Constellations positions={positions} color={universeColor} />
        </group>

        {/* 控制器 */}
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          autoRotate={!filter} // 如果没筛选，就自动旋转展示
          autoRotateSpeed={0.5}
          maxDistance={50}
          minDistance={2}
        />
      </Canvas>
    </div>
  )
}