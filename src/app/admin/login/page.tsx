"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Key, User, AlertCircle, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setLoading(true);
    signIn("google", { callbackUrl: "/" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill out all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.error || "Invalid username or password");
        setLoading(false);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-blue-deep text-white px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] rounded-full bg-brand-blue-light/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] rounded-full bg-brand-yellow/5 blur-[150px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-brand-blue-navy/60 border border-brand-blue-light/40 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative">
        {/* Header branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-yellow flex items-center justify-center font-black text-brand-blue-navy text-2xl shadow-lg shadow-brand-yellow/20 mb-4">
            D
          </div>
          <h1 className="text-2xl font-black tracking-tight leading-none text-white">
            DRIVEWELL ACADEMY
          </h1>
          <span className="text-brand-yellow font-bold text-xs uppercase tracking-widest leading-none mt-2">
            Admin Portal
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-200 font-semibold">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2"
            >
              Username
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-blue-light/50 bg-brand-blue-deep/50 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow/25 focus:border-brand-yellow disabled:opacity-50"
                placeholder="admin"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Key
                size={16}
                className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-brand-blue-light/50 bg-brand-blue-deep/50 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow/25 focus:border-brand-yellow disabled:opacity-50"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 rounded-xl bg-brand-yellow text-brand-blue-navy font-bold text-sm tracking-wide shadow-lg shadow-brand-yellow/10 hover:bg-brand-yellow-hover hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Shield size={16} />
                Access Control Panel
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-brand-blue-light/30"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">Or</span>
          <div className="flex-grow border-t border-brand-blue-light/30"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-white text-gray-900 font-bold text-sm tracking-wide shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-gray-200"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          Sign in with Google
        </button>

        <div className="mt-8 text-center text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
          <p>Authorized personnel only. Sessions are logged.</p>
        </div>
      </div>
    </div>
  );
}
