import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DEMO_SESSION_COOKIE } from '@/lib/local-mode'

const WEB_APP_URL = (process.env.WEB_URL || 'https://cops-platform-web.vercel.app').replace(/\/$/, '')

export default async function LoginPage() {
  const cookieStore = await cookies()
  const hasDemoSession = cookieStore.get(DEMO_SESSION_COOKIE)?.value === '1'

  if (hasDemoSession) {
    redirect('/dashboard')
  }

  redirect(`${WEB_APP_URL}/login`)
}
