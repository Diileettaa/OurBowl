import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 默认跳转到 dashboard，或者跳转到 next 参数指定的地址
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    // 关键动作：拿着“票”(code) 去换“身份证”(Session)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 换票成功，放行到 dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 如果换票失败，或者没有票，踢回首页并报错
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}