import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isSameDay, parseISO } from 'date-fns'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // 1. Get current month range
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 2. Fetch entries for this month
  const { data: entries } = await supabase
    .from('entries')
    .select('created_at, mood, content, image_url')
    .gte('created_at', monthStart.toISOString())
    .lte('created_at', monthEnd.toISOString())

  // Helper to find entry for a day
  const getEntryForDay = (day: Date) => {
    return entries?.find(e => isSameDay(parseISO(e.created_at), day))
  }

  // Helper for mood color
  const getMoodColor = (mood: string) => {
    if (!mood) return 'bg-gray-100'
    if (mood.includes('Joy')) return 'bg-orange-200'
    if (mood.includes('Calm')) return 'bg-emerald-200'
    if (mood.includes('Tired')) return 'bg-indigo-200'
    return 'bg-gray-200'
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-6 flex flex-col items-center">
      
      <div className="max-w-4xl w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">{format(today, 'MMMM yyyy')}</h1>
          <p className="text-gray-400 text-sm">Your emotional journey map</p>
        </div>

        <div className="bg-white rounded-[32px] shadow-clay p-8 border border-white">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-4 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-4">
            {days.map((day, i) => {
              const entry = getEntryForDay(day)
              return (
                <div 
                  key={day.toString()} 
                  className={`aspect-square rounded-2xl border border-transparent transition-all hover:scale-110 hover:shadow-md cursor-pointer relative overflow-hidden group ${
                    entry ? getMoodColor(entry.mood) : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className={`absolute top-2 left-2 text-sm font-bold ${!isSameMonth(day, today) ? 'text-gray-200' : 'text-gray-500'}`}>
                    {format(day, 'd')}
                  </span>

                  {/* If has image, show image as background */}
                  {entry?.image_url && (
                    <img src={entry.image_url} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  )}

                  {/* Mood Emoji */}
                  {entry && !entry.image_url && (
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">
                       {/* Simple mapping, can be improved */}
                       {entry.mood.includes('Joy') ? '🥰' : 
                        entry.mood.includes('Calm') ? '🌿' : '📝'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Simple Stats (Placeholder for now) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm">
            <div className="text-2xl font-bold text-gray-800">{entries?.length || 0}</div>
            <div className="text-xs text-gray-400 uppercase">Entries this month</div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm">
             <div className="text-2xl font-bold text-orange-400">
               {entries?.filter(e => e.mood?.includes('Joy')).length || 0}
             </div>
             <div className="text-xs text-gray-400 uppercase">Joyful Days</div>
          </div>
          {/* Add more stats here */}
        </div>
      </div>
    </div>
  )
}