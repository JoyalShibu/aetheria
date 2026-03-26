import { login, signup } from './actions'
import { User, Mail, Lock, ArrowRight } from 'lucide-react'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <main className="min-h-screen flex items-center justify-center p-8 text-foreground overflow-hidden">
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="glass-panel p-10 rounded-3xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl bg-black/60">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-void-light border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(255,100,255,0.15)] group hover:shadow-[0_0_50px_rgba(255,100,255,0.4)] transition-all duration-500">
              <User className="text-neon-pink/80 group-hover:text-neon-pink transition-colors" size={32} />
            </div>
          </div>
          
          <h1 className="text-3xl font-black text-center text-white mb-2 tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">AETHERIA ID</h1>
          <p className="text-white/40 text-center text-[10px] tracking-[0.3em] uppercase font-bold mb-10">User Authentication Terminal</p>

          <form className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-white/40" size={20} />
              <input
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white focus:outline-none focus:border-neon-pink focus:shadow-[0_0_20px_rgba(255,100,255,0.2)] transition-all font-mono tracking-widest shadow-inner placeholder:text-white/20"
                name="email"
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-white/40" size={20} />
              <input
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white focus:outline-none focus:border-neon-pink focus:shadow-[0_0_20px_rgba(255,100,255,0.2)] transition-all font-mono tracking-widest shadow-inner placeholder:text-white/20"
                type="password"
                name="password"
                placeholder="••••••••"
                required
              />
            </div>

            {searchParams?.message && (
              <p className="text-bright-coral text-xs text-center uppercase tracking-widest font-bold bg-bright-coral/10 py-3 rounded border border-bright-coral/20 mt-4 mb-4 text-balance">
                {searchParams.message}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                formAction={login}
                className="w-full bg-white/5 border border-white/10 text-white font-bold uppercase tracking-[0.1em] py-4 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-xs"
              >
                Sign In
              </button>
              <button
                formAction={signup}
                className="w-full bg-neon-pink/90 text-white font-bold uppercase tracking-[0.1em] py-4 rounded-xl hover:bg-neon-pink transition-all shadow-[0_0_20px_rgba(255,100,255,0.3)] text-xs"
              >
                Create Hub
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
