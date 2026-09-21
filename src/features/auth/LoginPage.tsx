import { useState } from "react";
import { Zap } from "lucide-react";
import { authService } from "@/services/auth.service";
import { Spinner } from "@/components/ui/Loading";
import { supabase } from "@/lib/supabase";

type Mode = "signin" | "signup";

export function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!email.trim() || !password.trim()) { setError("Email and password are required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      if (mode === "signup") {
        await authService.signUp(email, password);
        setSuccess("Account created! Check your email to confirm, then sign in.");
        setMode("signin");
      } else {
        await authService.signIn(email, password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: "https://project-1pcv1.vercel.app" },
      });
    } catch {
      setError("Google sign-in failed.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg glow-primary">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-100">AI Factory</h1>
            <p className="text-sm text-slate-500 mt-1">
              {mode === "signin" ? "Sign in to your account" : "Create your account"}
            </p>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          {/* Google button */}
          <button onClick={handleGoogle} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-lg border border-gray-200 transition-all min-h-[44px] disabled:opacity-50">
            {googleLoading ? <Spinner size="sm" /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-xs text-slate-500">or</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          {/* Alerts */}
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-sm text-emerald-400">{success}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="label">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" className="input" autoCapitalize="none" />
          </div>

          {/* Password */}
          <div>
            <label className="label">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" className="input"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
          </div>

          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full justify-center">
            {loading ? <Spinner size="sm" /> : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </div>

        <p className="text-center text-sm text-slate-500">
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setSuccess(""); }}
            className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
