import React, { useState } from 'react';
import { Lock, Mail, X, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { AuthResponse } from '../types';

interface AuthModalProps {
  onSuccess: (auth: AuthResponse) => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onSuccess,
  onClose,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        const res = await api.register(email, password);
        onSuccess(res);
      } else {
        const res = await api.login(email, password);
        onSuccess(res);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const res = await api.login('demo@lostandfound.app', 'password123');
      onSuccess(res);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[36px] bg-white border border-hinge-border p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 text-left"
      >
        <div className="flex items-center justify-between">
          <span className="font-serif font-black text-3xl tracking-tight text-hinge-black">
            lost & found
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h2 className="font-serif text-2xl font-bold text-hinge-black">
            {isSignUp ? 'Create your profile' : 'Sign In'}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            {isSignUp
              ? 'Join thoughtful daters looking for real connections'
              : 'Log in to access your matches and conversations'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-xs text-hinge-black placeholder-neutral-400 focus:outline-none focus:border-hinge-black font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-hinge-cream border border-hinge-border text-xs text-hinge-black placeholder-neutral-400 focus:outline-none focus:border-hinge-black font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full font-bold text-white bg-hinge-black hover:bg-neutral-800 shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-98 transition-all"
          >
            <span>{isLoading ? 'Connecting...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-hinge-border"></div></div>
          <span className="relative px-3 bg-white text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Or demo testing</span>
        </div>

        {/* 1-Click Demo Login */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full py-3 rounded-full bg-hinge-stone hover:bg-neutral-200 border border-hinge-border text-xs font-bold text-hinge-black flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-hinge-terracotta" />
          <span>One-Click Evaluator Demo Sign In</span>
        </button>

        <div className="text-center text-xs text-neutral-500 font-medium">
          {isSignUp ? (
            <span>Already have an account? <button type="button" onClick={() => setIsSignUp(false)} className="text-hinge-black font-bold hover:underline">Sign In</button></span>
          ) : (
            <span>New to Lost & Found? <button type="button" onClick={() => setIsSignUp(true)} className="text-hinge-black font-bold hover:underline">Create one</button></span>
          )}
        </div>
      </div>
    </div>
  );
};
