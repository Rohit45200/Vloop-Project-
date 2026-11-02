import React, { useState } from "react";
import {
  Trophy,
  Star,
  Coins,
  Cpu,
  Zap,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { RewardedAdPlayer } from "../ads/RewardedAdPlayer.tsx";
import { api } from "../../services/apiClient.ts";
import { audio } from "../../services/audioService.ts";

interface MissionResultModalProps {
  sessionId: string;
  mission: any;
  stats: {
    victory: boolean;
    score: number;
    enemiesKilled: number;
    bossKilled: boolean;
    powerUpsUsed: number;
    accuracy: number;
    durationSec: number;
    stars: number;
    creditsEarned: number;
    xpEarned: number;
    coresEarned: number;
  };
  onRestart: () => void;
  onNextMission: () => void;
  onReturnToHangar: () => void;
  onReviveSuccess?: () => void;
  canRevive?: boolean;
}

export const MissionResultModal: React.FC<MissionResultModalProps> = ({
  sessionId,
  mission,
  stats,
  onRestart,
  onNextMission,
  onReturnToHangar,
  onReviveSuccess,
  canRevive = false,
}) => {
  const [adPlacement, setAdPlacement] = useState<"REVIVE" | "DOUBLE_SCORE" | "DOUBLE_CREDITS" | null>(null);
  const [activeOpportunityId, setActiveOpportunityId] = useState<string | null>(null);
  const [doubleScoreClaimed, setDoubleScoreClaimed] = useState(false);
  const [doubleCreditsClaimed, setDoubleCreditsClaimed] = useState(false);
  const [currentScore, setCurrentScore] = useState(stats.score);
  const [currentCredits, setCurrentCredits] = useState(stats.creditsEarned);
  const [loadingAd, setLoadingAd] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Trigger ad opportunity flow (Section 46 State Machine)
  const handleInitiateAd = async (placement: "REVIVE" | "DOUBLE_SCORE" | "DOUBLE_CREDITS") => {
    try {
      setLoadingAd(true);
      setErrorMsg(null);
      let opp: any;
      if (placement === "DOUBLE_CREDITS") {
        opp = await api.requestAdOpportunity(sessionId, "DOUBLE_CREDITS", mission?.id);
      } else if (placement === "DOUBLE_SCORE") {
        opp = await api.requestAdOpportunity(sessionId, "DOUBLE_SCORE", mission?.id);
      } else if (placement === "REVIVE") {
        opp = await api.requestRevive(sessionId);
      }
      setActiveOpportunityId(opp.id);
      setAdPlacement(placement);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to initialize ad unit");
    } finally {
      setLoadingAd(false);
    }
  };

  const handleAdCompleted = async (eventId: string) => {
    if (!activeOpportunityId || !adPlacement) return;
    try {
      if (adPlacement === "DOUBLE_CREDITS") {
        const res = await api.claimAdReward(activeOpportunityId, eventId);
        if (res.success) {
          setDoubleCreditsClaimed(true);
          setCurrentCredits((prev) => prev * 2);
          audio.playVictory();
        }
      } else if (adPlacement === "DOUBLE_SCORE") {
        const res = await api.claimAdReward(activeOpportunityId, eventId);
        if (res.success) {
          setDoubleScoreClaimed(true);
          setCurrentScore((prev) => prev * 2);
          audio.playVictory();
        }
      } else if (adPlacement === "REVIVE") {
        const res = await api.verifyRevive(sessionId, activeOpportunityId);
        if (res.success && onReviveSuccess) {
          setAdPlacement(null);
          onReviveSuccess();
          return;
        }
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setAdPlacement(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      {adPlacement && (
        <RewardedAdPlayer
          placement={adPlacement}
          rewardLabel={
            adPlacement === "DOUBLE_CREDITS"
              ? `Double Credits (+${stats.creditsEarned} CR)`
              : adPlacement === "DOUBLE_SCORE"
              ? "2x Score Multiplier"
              : "Sortie Emergency Revive (50% Hull)"
          }
          onAdCompleted={handleAdCompleted}
          onAdCancelled={() => setAdPlacement(null)}
        />
      )}

      <div className="relative w-full max-w-lg rounded-2xl border border-cyan-500/40 bg-slate-900/95 p-6 shadow-2xl text-slate-100 overflow-hidden space-y-5">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="text-center space-y-1">
          {stats.victory ? (
            <>
              <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-1">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold font-display text-white tracking-wide">
                MISSION ACCOMPLISHED
              </h3>
              <p className="text-xs text-emerald-300 font-mono">
                {mission?.title || "Sector Patrol Completed"}
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex p-3 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 mb-1">
                <XCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold font-display text-rose-300 tracking-wide">
                MISSION FAILED
              </h3>
              <p className="text-xs text-rose-400 font-mono">
                Hull Breached • Life Support Compromised
              </p>
            </>
          )}
        </div>

        {/* Stars (Section 19) */}
        {stats.victory && (
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3].map((starIdx) => (
              <div
                key={starIdx}
                className={`p-2 rounded-xl border ${
                  starIdx <= stats.stars
                    ? "bg-yellow-500/20 border-yellow-400 text-yellow-400"
                    : "bg-slate-950 border-slate-800 text-slate-700"
                }`}
              >
                <Star
                  className={`w-7 h-7 ${
                    starIdx <= stats.stars ? "fill-yellow-400" : ""
                  }`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Score & Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
          <div>
            <span className="text-slate-400">FINAL SCORE:</span>
            <div className="text-base font-bold text-cyan-300 font-display">
              {currentScore.toLocaleString()}
              {doubleScoreClaimed && <span className="text-[10px] text-emerald-400 ml-1.5">(2X BOOST)</span>}
            </div>
          </div>

          <div>
            <span className="text-slate-400">SORTIE ACCURACY:</span>
            <div className="text-base font-bold text-white font-display">
              {stats.accuracy}%
            </div>
          </div>

          <div>
            <span className="text-slate-400">ENEMIES DESTROYED:</span>
            <div className="text-sm font-semibold text-slate-200">
              {stats.enemiesKilled} craft
            </div>
          </div>

          <div>
            <span className="text-slate-400">ELAPSED TIME:</span>
            <div className="text-sm font-semibold text-slate-200">
              {stats.durationSec}s
            </div>
          </div>
        </div>

        {/* Rewards Earned (Section 31 & 32) */}
        {stats.victory && (
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
              Authoritative Sortie Earnings
            </span>
            <div className="flex items-center justify-around text-center">
              <div>
                <span className="text-xs text-slate-400">Credits</span>
                <div className="text-lg font-bold text-cyan-300 font-display flex items-center justify-center gap-1">
                  <Coins className="w-4 h-4 text-cyan-400" />
                  +{currentCredits}
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400">Experience</span>
                <div className="text-lg font-bold text-purple-300 font-display flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4 text-purple-400" />
                  +{stats.xpEarned} XP
                </div>
              </div>

              {stats.coresEarned > 0 && (
                <div>
                  <span className="text-xs text-slate-400">Cores</span>
                  <div className="text-lg font-bold text-amber-300 font-display flex items-center justify-center gap-1">
                    <Cpu className="w-4 h-4 text-amber-400" />
                    +{stats.coresEarned}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rewarded Ad Offers (Section 41-43) */}
        {stats.victory ? (
          <div className="space-y-2">
            {!doubleCreditsClaimed && (
              <button
                onClick={() => handleInitiateAd("DOUBLE_CREDITS")}
                disabled={loadingAd}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-bold font-display text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                WATCH AD → GET DOUBLE CREDITS (+{stats.creditsEarned} CR)
              </button>
            )}

            {!doubleScoreClaimed && (
              <button
                onClick={() => handleInitiateAd("DOUBLE_SCORE")}
                disabled={loadingAd}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:brightness-110 text-white font-bold font-display text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                WATCH AD → DOUBLE FINAL SCORE (2X)
              </button>
            )}
          </div>
        ) : (
          canRevive && (
            <div className="space-y-2">
              <button
                onClick={() => handleInitiateAd("REVIVE")}
                disabled={loadingAd}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 hover:brightness-110 text-slate-950 font-bold font-display text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                WATCH AD & REVIVE AT CHECKPOINT (50% HULL)
              </button>
            </div>
          )
        )}

        {errorMsg && (
          <p className="text-xs text-rose-400 text-center">{errorMsg}</p>
        )}

        {/* Bottom Actions */}
        <div className="flex gap-2 pt-2 border-t border-white/10">
          <button
            onClick={onRestart}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart Sortie
          </button>

          {stats.victory && onNextMission && (
            <button
              onClick={onNextMission}
              className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-display flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              Next Mission
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onReturnToHangar}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium cursor-pointer transition-all"
          >
            Hangar
          </button>
        </div>
      </div>
    </div>
  );
};
