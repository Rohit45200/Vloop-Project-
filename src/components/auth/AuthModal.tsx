import React, { useState } from "react";
import { User, Lock, Mail, KeyRound, X, Sparkles, Rocket } from "lucide-react";
import { api } from "../../services/apiClient.ts";
import { audio } from "../../services/audioService.ts";
import { GAME_NAME } from "../../config/gameConfig.ts";

interface AuthModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    audio.playClick();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register(username, email, password);
        api.setToken(res.token);
      } else {
        const res = await api.login(email || username, password);
        api.setToken(res.token);
      }
      audio.playVictory();
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    audio.playClick();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await api.login("pilot@veloop.io", "pilot123");
      api.setToken(res.token);
      audio.playVictory();
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-cyan-500/40 bg-slate-900/95 p-6 shadow-2xl text-slate-100 overflow-hidden space-y-5">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-lg text-white">
              {isRegister ? "PILOT ENLISTMENT" : "PILOT AUTHORIZATION"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Sign into the {GAME_NAME} network to sync authoritative flight ledgers, ship upgrades, and VELoop rewards.
        </p>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-slate-300">Pilot Callsign / Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. StarAce99"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-300">
              {isRegister ? "Fleet Comm Address (Email)" : "Callsign or Email"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pilot@veloop.io"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300">Access Keycode (Password)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-300 hover:brightness-110 text-slate-950 font-bold font-display text-xs cursor-pointer shadow-lg shadow-cyan-500/20 transition-all"
          >
            {loading ? "Transmitting..." : isRegister ? "Complete Enlistment" : "Log In & Enter Cockpit"}
          </button>
        </form>

        {/* Quick Demo Pre-seed button */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 hover:bg-purple-900/60 text-purple-300 text-xs font-mono font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            Quick Demo Login (Commander Nova • Admin)
          </button>

          <div className="text-center">
            <button
              onClick={() => {
                setErrorMsg(null);
                setIsRegister((r) => !r);
              }}
              className="text-xs text-slate-400 hover:text-cyan-400 underline cursor-pointer"
            >
              {isRegister
                ? "Already have pilot credentials? Log in"
                : "New cadet? Enlist here for starting credits"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
