import React, { useState, useEffect } from "react";
import { Play, CheckCircle2, AlertTriangle, ShieldCheck, X, Sparkles } from "lucide-react";
import { audio } from "../../services/audioService.ts";

interface RewardedAdPlayerProps {
  placement: "REVIVE" | "DOUBLE_SCORE" | "DOUBLE_CREDITS" | "POWER_UP" | "DAILY_BONUS";
  rewardLabel: string;
  onAdCompleted: (eventId: string) => void;
  onAdCancelled: () => void;
}

const SPONSORS = [
  {
    brand: "VELoop Rewards Platform",
    tagline: "Gamified Engagement & Sustainable Ad Economics",
    description: "Earn platform coins, unlock high-tier space fleet vessels, and turn your play sessions into real rewards.",
    badgeColor: "bg-cyan-500",
    theme: "from-cyan-900/40 via-slate-900 to-slate-950",
  },
  {
    brand: "StarForge Quantum Hyperdrive",
    tagline: "Next-Gen Starship Components & Plasma Capacitors",
    description: "Upgrade your fleet with military-grade warp engines and dual-phase shields engineered for Deep Space.",
    badgeColor: "bg-purple-500",
    theme: "from-purple-900/40 via-slate-900 to-slate-950",
  },
  {
    brand: "CyberCore Autonomous Defense",
    tagline: "Zero-Latency Tactical AI Drones",
    description: "Equip your flagship with real-time target locking and nanite hull self-repair automation.",
    badgeColor: "bg-emerald-500",
    theme: "from-emerald-900/40 via-slate-900 to-slate-950",
  },
];

export const RewardedAdPlayer: React.FC<RewardedAdPlayerProps> = ({
  placement,
  rewardLabel,
  onAdCompleted,
  onAdCancelled,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(6);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [sponsor] = useState(() => SPONSORS[Math.floor(Math.random() * SPONSORS.length)]);

  useEffect(() => {
    if (secondsRemaining > 0) {
      const timer = setTimeout(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!isCompleted) {
      setIsCompleted(true);
      audio.playVictory();
    }
  }, [secondsRemaining, isCompleted]);

  const handleClaim = () => {
    const eventId = "evt_" + Math.random().toString(36).substring(2, 12);
    audio.playClick();
    onAdCompleted(eventId);
  };

  const handleAttemptClose = () => {
    if (isCompleted) {
      onAdCancelled();
    } else {
      setShowWarning(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className={`relative w-full max-w-xl rounded-2xl border border-cyan-500/40 bg-gradient-to-b ${sponsor.theme} p-6 shadow-2xl text-slate-100 overflow-hidden`}>
        {/* Top Header Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              VELoop Sponsored Ad Unit
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">
              Placement: {placement}
            </span>
          </div>

          <button
            onClick={handleAttemptClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video simulation / Interactive Unit */}
        <div className="relative my-5 rounded-xl border border-cyan-500/20 bg-slate-950/80 p-6 text-center overflow-hidden min-h-[220px] flex flex-col items-center justify-center">
          {/* Subtle animated scanlines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.5)_51%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

          {!isCompleted ? (
            <div className="space-y-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin flex items-center justify-center">
                  <Play className="w-8 h-8 text-cyan-400 ml-1 fill-cyan-400/20" />
                </div>
                <span className="absolute font-mono text-xl font-bold text-white">
                  {secondsRemaining}s
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  {sponsor.brand}
                </h3>
                <p className="text-sm text-cyan-300 font-medium">
                  {sponsor.tagline}
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                  {sponsor.description}
                </p>
              </div>

              <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Authoritative Ad Verification in progress • Do not close window
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-2 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white font-display">
                Ad Verification Complete!
              </h3>
              <p className="text-sm text-emerald-300 font-medium">
                Reward Unlocked: <span className="font-bold text-white underline">{rewardLabel}</span>
              </p>
              <p className="text-xs text-slate-400">
                A verified transaction hash will be committed to your authoritative wallet ledger.
              </p>
            </div>
          )}
        </div>

        {/* Warning Modal if closed prematurely */}
        {showWarning && !isCompleted && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200 text-xs">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Reward Not Yet Earned!</p>
              <p className="mt-0.5 text-amber-300/80">
                If you leave now, you will lose the offer for <strong>{rewardLabel}</strong>. Watch remaining {secondsRemaining}s to claim.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setShowWarning(false)}
                  className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition-colors"
                >
                  Continue Watching
                </button>
                <button
                  onClick={onAdCancelled}
                  className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors text-slate-300"
                >
                  Skip & Forfeit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400">
            Powered by <strong className="text-cyan-400">VELoop Rewards Engine</strong>
          </div>

          {isCompleted ? (
            <button
              onClick={handleClaim}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:brightness-110 shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer font-display"
            >
              <CheckCircle2 className="w-4 h-4" />
              Claim {rewardLabel}
            </button>
          ) : (
            <button
              onClick={handleAttemptClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel Offer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
