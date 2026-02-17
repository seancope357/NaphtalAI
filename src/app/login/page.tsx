'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

import type { Database } from '@/database.types'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    setSupabase(createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ))
  }, [])

  const handleSignUp = async () => {
    await supabase.auth.signUp({
      email,
      password,
    })
    router.refresh()
  }

  const handleSignIn = async () => {
    await supabase.auth.signInWithPassword({
      email,
      password,
    })
    router.refresh()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
          Your AI-Powered Second Brain
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Capture, connect, and create like never before. NaphtalAI is a knowledge
          creation tool that helps you build a personal knowledge base and
          discover hidden connections.
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="mt-10">Get Started</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Authenticate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <input
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                placeholder="Email"
                className="w-full p-2 border rounded"
              />
              <input
                type="password"
                name="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                placeholder="Password"
                className="w-full p-2 border rounded"
              />
              <Button onClick={handleSignUp} className="w-full">Sign Up</Button>
              <Button onClick={handleSignIn} className="w-full">Sign In</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
