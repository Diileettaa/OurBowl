'use client'
import { useState } from 'react'
import { supabase } from '@/utils/supabase/client'

export default function Home() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Handle login logic
  // Handle login logic
  const handleLogin = async () => {
    setLoading(true)
    
    // 👇 核心修改：明确告诉代码，线上环境用线上地址，本地用本地地址
    // 这样绝对不会搞错！
    const redirectUrl = process.env.NODE_ENV === 'production'
      ? 'https://ourbowl.vercel.app/auth/callback' // 线上地址
      : 'http://localhost:3000/auth/callback'      // 本地地址

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: 'https://ourbowl.vercel.app/auth/callback',
      },
    })

    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('✅ Magic Link sent! Please check your email (and spam folder).')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8] text-gray-800">
      {/* Container for the "Bowl" metaphor */}
      <div className="w-full max-w-md p-8 bg-white rounded-[32px] shadow-xl border border-gray-100 text-center">
        
        {/* Logo Area */}
        <div className="mb-6 text-6xl">🥣</div>
        <h1 className="text-3xl font-bold mb-2 text-[#8D99AE]">Ourbowl</h1>
        <p className="text-gray-400 mb-8 text-sm">Track moods, soothe your soul.</p>

        {/* Input Area */}
        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FFD166] transition-all"
          />
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full p-4 bg-[#FFD166] text-white font-bold rounded-2xl hover:bg-[#FFC145] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Sending...' : '✨ Send Magic Link'}
          </button>
        </div>

        {/* Message Toast */}
        {message && (
          <div className="mt-6 p-4 bg-blue-50 text-blue-600 rounded-xl text-sm">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}