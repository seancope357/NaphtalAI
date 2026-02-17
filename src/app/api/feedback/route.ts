import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

import type { Database } from '@/database.types'

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { feedback } = await req.json()
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  if (!feedback) {
    return new NextResponse('Feedback is required', { status: 400 })
  }

  const { data, error } = await supabase
    .from('feedback')
    .insert([{ feedback, user_id: session.user.id }])
    .select()

  if (error) {
    console.error('Error inserting feedback:', error)
    return new NextResponse('Error inserting feedback', { status: 500 })
  }

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'seancope357@gmail.com',
      subject: 'New Feedback from NaphtalAI',
      html: `<p>A user has submitted the following feedback:</p><p>${feedback}</p>`,
    })
  } catch (emailError) {
    console.error('Error sending email:', emailError)
    // Don't block the response for the user if the email fails
  }

  return NextResponse.json(data)
}
