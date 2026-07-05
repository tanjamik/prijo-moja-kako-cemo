import React, { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';

const AUTH_KEY = 'koordinator_auth';
const PASS_HASH = '6168837383436046';

const cyrb53 = (str: string, seed = 0): number => {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

export default function LoginGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => {
    try {
      return localStorage.getItem(AUTH_KEY) === PASS_HASH;
    } catch {
      return false;
    }
  });
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  if (unlocked) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (String(cyrb53(input.trim())) === PASS_HASH) {
      try {
        localStorage.setItem(AUTH_KEY, PASS_HASH);
      } catch {}
      setUnlocked(true);
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-[#090b0f] text-gray-100 flex items-center justify-center font-sans p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-[#101318] border border-[#1e222b] rounded-2xl p-8 flex flex-col items-center gap-5"
      >
        <div className="w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center">
          <Lock className="w-6 h-6 text-blue-400" />
        </div>
        <div className="text-center">
          <h1 className="text-lg font-extrabold text-white">KOORDINATOR</h1>
          <p className="text-xs text-gray-500 mt-1">Unesi šifru za pristup sistemu</p>
        </div>
        <input
          type="password"
          autoFocus
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(false);
          }}
          placeholder="Šifra"
          className={`w-full px-4 py-2.5 text-sm bg-[#0c0e12] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-[#1e222b]'
          }`}
        />
        {error && <p className="text-xs text-red-400 -mt-2">Pogrešna šifra, probaj ponovo.</p>}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl px-4 py-2.5 transition-colors"
        >
          Uđi <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
