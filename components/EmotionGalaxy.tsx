'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Float, Stars, Line } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

type Entry = {
  id: string
  content: string
  mood: string
  created_at: string
}

// 1. 星球组件 (变得更亮、有发光感)
function Planet({ entry, position }: { entry: Entry; position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const color = useMemo(() => {
    switch (entry.mood) {
      case 'joy': return '#FFD166'    // 亮黄
      case 'sad': return '#118AB2'    // 亮蓝
      case 'energy': return '#EF476F' // 荧光红
      default: return '#06D6A0'       // 荧光绿
    }
  }, [entry.mood])

  useFrame((state) => {
    if (meshRef.current) {
      // 让星球轻微浮动呼吸
      meshRef.current.rotation.y += 0.01
      const t = state.clock.getElapsedTime()
      meshRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05) // 呼吸效果
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <group position={position}>
        <mesh ref={meshRef}>
          {/* 换成二十面体，更有科技感 */}
          <icosahedronGeometry args={[0.8, 1]} /> 
          {/* 发光材质 */}
          <meshStandardMaterial 
            color={color} 
            emissive={color} // 自发光
            emissiveIntensity={0.5} 
            roughness={0.2} 
          />
        </mesh>
        
        {/* 文字标签 */}
        <Text
          position={[0, -1.4, 0]}
          fontSize={0.4}
          color="white" // 改成白色字
          anchorX="center"
          anchorY="middle"
          maxWidth={3}
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {entry.content.slice(0, 8) + (entry.content.length > 8 ? '...' : '')}
        </Text>
      </group>
    </Float>
  )
}

// 2. 连线组件 (像星座一样连接)
function Constellations({ positions }: { positions: [number, number, number][] }) {
  const points = useMemo(() => {
    // 简单逻辑：把所有点按顺序连起来，或者随机连
    // 这里演示：每两个点之间连一条淡淡的线
    const p: THREE.Vector3[] = []
    for (let i = 0; i < positions.length - 1; i++) {
      p.push(new THREE.Vector3(...positions[i]))
      p.push(new THREE.Vector3(...positions[i+1]))
    }
    return p
  }, [positions])

  if (points.length < 2) return null

  return (
    <Line
      points={points}       // 连线点
      color="white"         // 线条颜色
      opacity={0.1}         // 透明度 (很淡)
      transparent
      lineWidth={1}         // 线宽
      segments              // 分段连接
    />
  )
}

// 3. 主组件
export default function EmotionGalaxy({ entries }: { entries: Entry[] }) {
  // 计算坐标
  const positions = useMemo(() => {
    return entries.map((_, i) => {
      // 螺旋分布算法 (让星球分布得更有规律，像银河系)
      const angle = i * 0.8 
      const radius = 3 + i * 0.5
      return [
        Math.cos(angle) * radius + (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 5, // Y轴稍微随机一点
        Math.sin(angle) * radius + (Math.random() - 0.5) * 2
      ] as [number, number, number]
    })
  }, [entries])

  return (
    // 移除之前的圆角和边框，改为全黑背景容器
    <div className="w-full h-full min-h-[600px] bg-black relative">
      <Canvas camera={{ position: [0, 2, 15], fov: 50 }}>
        {/* 黑色宇宙背景色 */}
        <color attach="background" args={['#050505']} />
        
        {/* 雾效 (让远处的星星变暗，增加深邃感) */}
        <fog attach="fog" args={['#050505', 10, 25]} />

        {/* 💡 灯光 */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#purple" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#blue" />

        {/* ✨ 满天繁星背景 */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* 🪐 所有日记星球 */}
        {entries.map((entry, i) => (
          <Planet key={entry.id} entry={entry} position={positions[i]} />
        ))}

        {/* 🔗 星座连线 */}
        <Constellations positions={positions} />

        {/* 🎮 控制器 (自动旋转) */}
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          autoRotate // 开启自动旋转
          autoRotateSpeed={0.5}
          maxDistance={30}
          minDistance={5}
        />
      </Canvas>
      
      {/* UI 提示 */}
      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
        <p className="text-white/30 text-xs tracking-[0.3em] uppercase">Emotional Universe</p>
      </div>
    </div>
  )
}