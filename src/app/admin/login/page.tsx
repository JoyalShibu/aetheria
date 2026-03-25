'use client'

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/authActions';
import { Lock, ArrowRight } from 'lucide-react';
import CanvasBackground from '@/components/CanvasBackground';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-white text-black font-black uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-neon-cyan hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {pending ? 'Decrypting...' : 'Enter Dashboard'}
      <ArrowRight size={20} />
    </button>
  );
}

export default function AdminLogin() {
  const [state, formAction] = useActionState(loginAction, null);

  return (
    <main className="min-h-screen flex items-center justify-center p-8 text-foreground overflow-hidden">
      
      <div className="relative z-10 w-full max-w-md animate-fade-in-up">
        <div className="glass-panel p-10 rounded-3xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl bg-black/60">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-void-light border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(0,229,255,0.15)] group hover:shadow-[0_0_50px_rgba(0,229,255,0.4)] transition-all duration-500">
              <Lock className="text-neon-cyan/80 group-hover:text-neon-cyan transition-colors" size={32} />
            </div>
          </div>
          
          <h1 className="text-3xl font-black text-center text-white mb-2 tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">AETHERIA CORE</h1>
          <p className="text-white/40 text-center text-[10px] tracking-[0.3em] uppercase font-bold mb-10">Admin Access Terminal</p>

          <form action={formAction} className="space-y-6">
            <div>
              <input 
                type="password" 
                name="password"
                placeholder="Enter Master Cipher..."
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all font-mono tracking-widest text-center shadow-inner"
              />
            </div>
            
            {state?.error && (
              <p className="text-bright-coral text-xs text-center uppercase tracking-widest font-bold bg-bright-coral/10 py-3 rounded border border-bright-coral/20">
                {state.error}
              </p>
            )}

            <SubmitButton />
          </form>
        </div>
      </div>
    </main>
  );
}
