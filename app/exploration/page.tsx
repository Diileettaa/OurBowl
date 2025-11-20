import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EmotionGalaxy from '@/components/EmotionGalaxy'

export default async function ExplorationPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/')
  }

  const { data: entries } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 flex flex-col">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-4 max-w-7xl mx-auto w-full z-10 px-4">
        <h1 className="text-xl font-bold text-white/80 tracking-widest">
          OURBOWL GALAXY
        </h1>
        <Link 
          href="/dashboard"
          className="px-4 py-2 bg-white/10 border border-white/10 rounded-full hover:bg-white/20 transition-all backdrop-blur-sm text-sm"
        >
          &larr; Back to Earth
        </Link>
      </div>

      {/* Fullscreen 3D Area */}
      <div className="flex-1 w-full h-[85vh] mx-auto relative rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
        {entries && entries.length > 0 ? (
          <div className="absolute inset-0">
             <EmotionGalaxy entries={entries} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            The universe is empty...
          </div>
        )}
      </div>
    </div>
  )
}