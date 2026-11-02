import React, { useState, useEffect } from "react";
import {
  Calendar,
  Gift,
  Trophy,
  Target,
  Clock,
  Sparkles,
  CheckCircle2,
  Package,
  Medal,
  Flame,
  Award,
  ChevronRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { api } from "../../services/apiClient.ts";
import { audio } from "../../services/audioService.ts";

interface EngagementHubProps {
  profile: any;
  wallet: any;
  onRefreshData: () => void;
}

export const EngagementHub: React.FC<EngagementHubProps> = ({
  profile,
  wallet,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<"daily" | "streak" | "achievements" | "leaderboard" | "supply">("daily");
  const [dailyMissions, setDailyMissions] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myRank, setMyRank] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [supplyResult, setSupplyResult] = useState<any | null>(null);

  useEffect(() => {
    loadHubData();
  }, [activeTab]);

  const loadHubData = async () => {
    try {
      setLoading(true);
      const [dailies, achs, lb, evts] = await Promise.all([
        api.getDailyMissions(),
        api.getAchievements(),
        api.getLeaderboard(),
        api.getEvents(),
      ]);
      setDailyMissions(dailies);
      setAchievements(achs);
      setLeaderboard(lb.leaderboard);
      setMyRank(lb.myRank);
      setEvents(evts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDailyMission = async (missionId: string) => {
    audio.playPickup();
    try {
      await api.claimDailyMission(missionId);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      setActionMsg({ text: "Daily mission reward credited to your wallet!" });
      loadHubData();
      onRefreshData();
    } catch (e: any) {
      setActionMsg({ text: e.message, error: true });
    }
  };

  const handleClaimStreak = async () => {
    audio.playPickup();
    try {
      const res = await api.claimDailyLogin();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      setActionMsg({ text: `Day ${res.streak} Login Streak Claimed! (+${res.rewards.credits} Credits, +${res.rewards.coins} Coins)` });
      loadHubData();
      onRefreshData();
    } catch (e: any) {
      setActionMsg({ text: e.message, error: true });
    }
  };

  const handleOpenSupplyDrop = async () => {
    audio.playShield();
    try {
      const res = await api.claimSupplyDrop();
      confetti({ particleCount: 90, spread: 90, origin: { y: 0.5 } });
      setSupplyResult(res.reward);
      loadHubData();
      onRefreshData();
    } catch (e: any) {
      setActionMsg({ text: e.message, error: true });
    }
  };

  const streakDays = [
    { day: 1, reward: "100 CR + 2 Coins" },
    { day: 2, reward: "150 CR + 1 Core" },
    { day: 3, reward: "200 CR + 5 Coins" },
    { day: 4, reward: "250 CR + 2 Cores" },
    { day: 5, reward: "350 CR + 8 Coins" },
    { day: 6, reward: "500 CR + 3 Cores" },
    { day: 7, reward: "1,000 CR + 5 Cores + 25 Coins" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            PART VIII • ENGAGEMENT & RETENTION HUB
          </span>
          <h2 className="text-2xl font-bold font-display text-white mt-1">
            OPS COMMAND & ACHIEVEMENTS
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Claim daily flight orders, advance your login streak, open orbital supply drops, and compete on the global leaderboard.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          {[
            { id: "daily", label: "Daily Ops", icon: Target },
            { id: "streak", label: "Login Streak", icon: Calendar },
            { id: "supply", label: "Supply Drop", icon: Package },
            { id: "achievements", label: "Badges", icon: Medal },
            { id: "leaderboard", label: "Leaderboard", icon: Trophy },
          ].map((t) => {
            const Icon = t.icon;
            const isSel = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  audio.playClick();
                  setActiveTab(t.id as any);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSel ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {actionMsg && (
        <div
          className={`p-3 rounded-xl border text-xs flex justify-between items-center ${
            actionMsg.error
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          }`}
        >
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Tab 1: Daily Missions (Section 52) */}
      {activeTab === "daily" && (
        <div className="space-y-4">
          {/* Limited Time Event Banner (Section 58) */}
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-5 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  LIMITED TIME EVENT • ACTIVE
                </span>
                <h3 className="text-lg font-bold font-display text-white">{evt.title}</h3>
                <p className="text-xs text-slate-300">{evt.description}</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400">BOUNTY:</span>
                  <div className="text-amber-300 font-bold font-display">+{evt.rewardCredits} CR & +{evt.rewardCores} CORES</div>
                </div>
              </div>
            </div>
          ))}

          {/* Daily Missions Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dailyMissions.map((dm) => {
              const progressPct = Math.min(100, Math.round((dm.progress / dm.requiredCount) * 100));

              return (
                <div
                  key={dm.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-4"
                >
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                      DAILY OBJECTIVE
                    </span>
                    <h4 className="text-base font-bold font-display text-white mt-1">
                      {dm.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">{dm.description}</p>

                    {/* Progress bar */}
                    <div className="mt-4 space-y-1 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Progress</span>
                        <span className="text-cyan-300 font-bold">
                          {dm.progress} / {dm.requiredCount}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-cyan-400 transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3">
                    <span className="text-xs font-mono text-cyan-300 font-bold">
                      +{dm.rewardCredits} CR • +{dm.rewardXP} XP
                    </span>

                    {dm.claimed ? (
                      <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                      </span>
                    ) : dm.completed ? (
                      <button
                        onClick={() => handleClaimDailyMission(dm.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold font-display bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer shadow-lg shadow-emerald-500/20"
                      >
                        Claim Reward
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-slate-500">In Progress</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: 7-Day Login Streak (Section 53) */}
      {activeTab === "streak" && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h3 className="font-display font-bold text-white text-xl flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                7-DAY LOGIN STREAK CALENDAR
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Log in daily to claim escalating credit bundles, energy cores, and platform VELoop Coins.
              </p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 font-mono text-sm flex items-center gap-2">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Current Streak: <strong>{profile?.dailyStreak || 1} Days</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {streakDays.map((s) => {
              const currentDay = profile?.dailyStreak || 1;
              const isPast = s.day < currentDay;
              const isCurrent = s.day === currentDay;

              return (
                <div
                  key={s.day}
                  className={`p-3.5 rounded-xl border text-center flex flex-col justify-between min-h-[130px] ${
                    isCurrent
                      ? "border-amber-400 bg-amber-950/30 shadow-lg shadow-amber-500/20"
                      : isPast
                      ? "border-slate-800 bg-slate-950/50 opacity-60"
                      : "border-slate-800 bg-slate-900/40"
                  }`}
                >
                  <div className="text-[11px] font-mono text-slate-400">Day {s.day}</div>
                  <div className="my-2">
                    <Gift className={`w-6 h-6 mx-auto ${isCurrent ? "text-amber-400" : "text-slate-500"}`} />
                  </div>
                  <div className="text-[10px] font-mono font-bold text-white leading-tight">
                    {s.reward}
                  </div>
                  {isPast && (
                    <span className="text-[9px] font-mono text-emerald-400 mt-1 flex items-center justify-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Claimed
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={handleClaimStreak}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-bold font-display text-sm hover:brightness-110 shadow-lg shadow-amber-500/25 cursor-pointer transition-all flex items-center gap-2"
            >
              <Gift className="w-4 h-4" />
              Claim Today's Streak Reward
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Orbital Supply Drop (Section 57) */}
      {activeTab === "supply" && (
        <div className="rounded-2xl bg-slate-900/80 border border-cyan-500/30 p-6 space-y-6 text-center max-w-xl mx-auto">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              ORBITAL CARGO DECRYPTION
            </span>
            <h3 className="text-2xl font-bold font-display text-white mt-1">
              SUPPLY DROP CACHE
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Decrypt random tactical caches with certified server-side RNG.
            </p>
          </div>

          {/* Animated Crate Icon */}
          <div className="relative w-36 h-36 mx-auto rounded-3xl bg-slate-950 border-2 border-cyan-500/40 flex items-center justify-center shadow-[0_0_35px_rgba(56,189,248,0.2)]">
            <Package className="w-16 h-16 text-cyan-400 animate-pulse" />
          </div>

          {/* Supply Result Notification */}
          {supplyResult && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 animate-fade-in space-y-1">
              <span className="text-xs font-mono uppercase">DECRYPTION SUCCESSFUL</span>
              <div className="text-lg font-bold font-display text-white">
                {supplyResult.label}
              </div>
            </div>
          )}

          {/* Probabilities table */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-left text-xs font-mono space-y-1.5 text-slate-300">
            <span className="text-[10px] text-slate-500 block uppercase">Certified Drop Probabilities:</span>
            <div className="flex justify-between">
              <span>Bulk Credits (200 - 450 CR):</span>
              <span className="text-cyan-400 font-bold">45.0%</span>
            </div>
            <div className="flex justify-between">
              <span>2x Combat Modules Pack:</span>
              <span className="text-cyan-400 font-bold">30.0%</span>
            </div>
            <div className="flex justify-between">
              <span>Rare Energy Cores (2 - 4):</span>
              <span className="text-purple-400 font-bold">17.0%</span>
            </div>
            <div className="flex justify-between">
              <span>VELoop Platform Coin Jackpot:</span>
              <span className="text-amber-400 font-bold">8.0%</span>
            </div>
          </div>

          <button
            onClick={handleOpenSupplyDrop}
            className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-display text-sm shadow-lg shadow-cyan-500/25 cursor-pointer transition-all"
          >
            Open Supply Drop (Cost: 150 Credits)
          </button>
        </div>
      )}

      {/* Tab 4: Achievements & Badges (Section 54) */}
      {activeTab === "achievements" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                a.unlocked
                  ? "bg-slate-900/90 border-cyan-500/40 shadow-lg shadow-cyan-500/10"
                  : "bg-slate-950/60 border-slate-800/80 opacity-60"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                  a.unlocked
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-400"
                    : "bg-slate-900 border-slate-800 text-slate-600"
                }`}
              >
                <Medal className="w-6 h-6" />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-sm text-white">
                    {a.title}
                  </h4>
                  {a.unlocked && (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> UNLOCKED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{a.description}</p>
                <div className="mt-2 text-[10px] font-mono text-cyan-300">
                  Reward: +{a.rewardCredits} CR • +{a.rewardXP} XP
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Global Leaderboard (Section 59) */}
      {activeTab === "leaderboard" && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              GALACTIC ACE LEADERBOARD
            </h3>
            {myRank && (
              <span className="text-xs font-mono text-cyan-400 font-bold">
                Your Rank: #{myRank.rank} ({myRank.score.toLocaleString()} PTS)
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2.5 px-3">RANK</th>
                  <th className="py-2.5 px-3">PILOT CALLSIGN</th>
                  <th className="py-2.5 px-3">FLAGSHIP</th>
                  <th className="py-2.5 px-3">LEVEL</th>
                  <th className="py-2.5 px-3">SORTIES WON</th>
                  <th className="py-2.5 px-3">COMBAT SCORE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {leaderboard.map((entry) => {
                  const isTop3 = entry.rank <= 3;
                  return (
                    <tr
                      key={entry.userId}
                      className={`hover:bg-slate-800/40 ${
                        entry.userId === profile?.userId ? "bg-cyan-950/40 border-l-2 border-cyan-400" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold font-display">
                        {entry.rank === 1 ? (
                          <span className="text-yellow-400">#1 👑</span>
                        ) : entry.rank === 2 ? (
                          <span className="text-slate-300">#2 🥈</span>
                        ) : entry.rank === 3 ? (
                          <span className="text-amber-500">#3 🥉</span>
                        ) : (
                          `#${entry.rank}`
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">{entry.displayName}</td>
                      <td className="py-2.5 px-3 text-cyan-300">{entry.shipName}</td>
                      <td className="py-2.5 px-3">Lvl {entry.level}</td>
                      <td className="py-2.5 px-3">{entry.missionsCompleted}</td>
                      <td className="py-2.5 px-3 font-bold text-yellow-400 font-display">
                        {entry.score.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
