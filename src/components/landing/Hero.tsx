'use client'

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { ArrowDown } from "lucide-react";

export default function Hero() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    setSupabase(
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    );
  }, []);

  const handleSignUp = async () => {
    await supabase.auth.signUp({
      email,
      password,
    });
    router.refresh();
  };

  const handleSignIn = async () => {
    await supabase.auth.signInWithPassword({
      email,
      password,
    });
    router.refresh();
  };

  return (
    <section className="relative flex items-center justify-center min-h-screen text-center">
      <div className="container relative">
        <h1 className="text-6xl font-bold md:text-8xl">
          Ask Anything. <br />
          Discover <span className="text-primary">Everything.</span>
        </h1>
        <p className="max-w-2xl mx-auto mt-4 text-lg md:text-xl text-muted-foreground">
          The most comprehensive research platform for Freemasonry. Court
          documents, flight logs, and depositions — indexed, connected, and searchable.
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg" className="mt-8">
              Dive into the Files
            </Button>
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
              <Button onClick={handleSignUp} className="w-full">
                Sign Up
              </Button>
              <Button onClick={handleSignIn} className="w-full">
                Sign In
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <div className="mt-8">
          <a href="#" className="flex items-center justify-center text-muted-foreground hover:text-foreground">
            See under the hood <ArrowDown className="w-4 h-4 ml-2" />
          </a>
        </div>
      </div>
    </section>
  );
}
