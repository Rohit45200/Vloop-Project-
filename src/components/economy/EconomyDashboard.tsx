import React, { useState, useEffect } from "react";
import {
  Coins,
  Cpu,
  Zap,
  Sparkles,
  TrendingUp,
  History,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Layers,
} from "lucide-react";
import { api } from "../../services/apiClient.ts";
import { audio } from "../../services/audioService.ts";

interface EconomyDashboardProps {
  wallet: any;
  isAdmin: boolean;
  onRefreshData: () => void;
}

export const EconomyDashboard: React.FC<EconomyDashboardProps> = ({
  wallet,
  isAdmin,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<"wallet" | "ad_ledger" | "admin">("wallet");
  const [walletHistory, setWalletHistory] = useState<any[]>([]);
  const [rewardHistory, setRewardHistory] = useState<any[]>([]);
  const [adminMetrics, setAdminMetrics] = useState<any | null>(null);
  const [economyConfig, setEconomyConfig] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadLedgers();
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadLedgers = async () => {
    try {
      setLoading(true);
      const data = await api.getPlayerHistory();
      setWalletHistory(data.walletHistory || []);
      setRewardHistory(data.rewardHistory || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      const [metrics, config] = await Promise.all([
        api.getAdminMetrics(),
        api.getEconomyConfig(),
      ]);
      setAdminMetrics(metrics);
      setEconomyConfig(config);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!economyConfig) return;
    try {
      audio.playClick();
      await api.updateEconomyConfig(economyConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-md">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            PART VI & PART XIII • VELOOP REWARDS ENGINE
          </span>
          <h2 className="text-2xl font-bold font-display text-white mt-1">
            ECONOMY & REWARD LEDGER
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Authoritative multi-currency ledger, anti-cheat validation logs, and sustainable rewarded-ad conversion analytics.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setActiveTab("wallet")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "wallet"
                ? "bg-cyan-500 text-slate-950"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Wallet Ledger
          </button>
          <button
            onClick={() => setActiveTab("ad_ledger")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === "ad_ledger"
                ? "bg-cyan-500 text-slate-950"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Ad Verifications
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === "admin"
                  ? "bg-purple-500 text-white"
                  : "text-purple-400 hover:text-purple-300"
              }`}
            >
              Admin Audit
            </button>
          )}
        </div>
      </div>

      {/* 4 Currency Cards (Section 31) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Credits */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
            <span>CREDITS</span>
            <Coins className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {wallet?.credits?.toLocaleString() || 0}
          </div>
          <p className="text-[10px] text-slate-400">
            Standard currency for ship upgrades and armory items.
          </p>
        </div>

        {/* Energy Cores */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-purple-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-purple-400">
            <span>ENERGY CORES</span>
            <Cpu className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {wallet?.energyCores?.toLocaleString() || 0}
          </div>
          <p className="text-[10px] text-slate-400">
            Rare progression currency earned via boss fights & streaks.
          </p>
        </div>

        {/* VELoop Coins */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
            <span>VELOOP REWARD COINS</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-display text-emerald-300">
            {wallet?.veloopCoins?.toLocaleString() || 0}
          </div>
          <p className="text-[10px] text-slate-400">
            Platform-backed reward balance eligible for platform claims.
          </p>
        </div>

        {/* Sustainability index */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-amber-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-amber-400">
            <span>VELOOP INTEGRITY</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-display text-amber-300">
            AUTHORITATIVE
          </div>
          <p className="text-[10px] text-slate-400">
            Atomic transactions & server validation enforced.
          </p>
        </div>
      </div>

      {/* Tab 1: Wallet Transaction Ledger (Section 36) */}
      {activeTab === "wallet" && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              AUTHORITATIVE WALLET TRANSACTION LEDGER
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Showing {walletHistory.length} ledger events
            </span>
          </div>

          {walletHistory.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs font-mono">
              No transactions recorded yet. Launch sorties or claim daily login to generate entries.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">TX ID</th>
                    <th className="py-2.5 px-3">TYPE</th>
                    <th className="py-2.5 px-3">AMOUNT</th>
                    <th className="py-2.5 px-3">BEFORE</th>
                    <th className="py-2.5 px-3">AFTER</th>
                    <th className="py-2.5 px-3">SOURCE / EVENT</th>
                    <th className="py-2.5 px-3">TIME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {walletHistory.map((tx) => {
                    const isPositive = ["CREDIT", "MISSION_REWARD", "BOSS_REWARD", "AD_REWARD", "DAILY_BONUS", "SUPPLY_DROP"].includes(tx.type);
                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 text-slate-400">{tx.id}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isPositive ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className={`py-2.5 px-3 font-bold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                          {isPositive ? "+" : "-"}{tx.amount} {tx.currency}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{tx.balanceBefore}</td>
                        <td className="py-2.5 px-3 text-cyan-300 font-bold">{tx.balanceAfter}</td>
                        <td className="py-2.5 px-3 max-w-xs truncate text-slate-300">{tx.source}</td>
                        <td className="py-2.5 px-3 text-slate-400">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Rewarded Ad Transaction Ledger (Section 37) */}
      {activeTab === "ad_ledger" && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              REWARDED AD AUDIT LEDGER (SECTION 37)
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Verified Event Stream
            </span>
          </div>

          {rewardHistory.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs font-mono">
              No rewarded ads recorded yet. Watch rewarded ads upon defeat (revive) or victory (double rewards) to view logs.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3">RECORD ID</th>
                    <th className="py-2.5 px-3">PLACEMENT</th>
                    <th className="py-2.5 px-3">MULTIPLIER</th>
                    <th className="py-2.5 px-3">PROVIDER</th>
                    <th className="py-2.5 px-3">VERIFICATION</th>
                    <th className="py-2.5 px-3">TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {rewardHistory.map((rtx) => (
                    <tr key={rtx.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 text-slate-400">{rtx.id}</td>
                      <td className="py-2.5 px-3 text-cyan-300 font-bold">{rtx.rewardType}</td>
                      <td className="py-2.5 px-3 text-amber-400 font-bold">{rtx.multiplier}x</td>
                      <td className="py-2.5 px-3 text-slate-300">{rtx.adProvider}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {rtx.verificationStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{new Date(rtx.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Admin Economy Dashboard & Remote Tuning (Section 75 & 35) */}
      {activeTab === "admin" && isAdmin && (
        <div className="space-y-6">
          {/* Metrics summary */}
          {adminMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30 space-y-1">
                <span className="text-[11px] font-mono text-purple-300">AD OPPORTUNITIES</span>
                <div className="text-2xl font-bold font-display text-white">{adminMetrics.totalAdOpportunities}</div>
                <div className="text-[10px] text-slate-400">Completed: {adminMetrics.completedRewardedAds}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-1">
                <span className="text-[11px] font-mono text-emerald-300">AD COMPLETION RATE</span>
                <div className="text-2xl font-bold font-display text-emerald-400">{adminMetrics.rewardedAdCompletionRate}%</div>
                <div className="text-[10px] text-slate-400">Industry benchmark: 60-85%</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-1">
                <span className="text-[11px] font-mono text-cyan-300">TOTAL CREDITS GRANTED</span>
                <div className="text-2xl font-bold font-display text-cyan-400">{adminMetrics.creditsGranted.toLocaleString()}</div>
                <div className="text-[10px] text-slate-400">Credits sunk: {adminMetrics.creditsSpent.toLocaleString()}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/30 space-y-1">
                <span className="text-[11px] font-mono text-rose-300">FRAUD REJECTIONS</span>
                <div className="text-2xl font-bold font-display text-rose-400">{adminMetrics.rewardRejectionCount}</div>
                <div className="text-[10px] text-slate-400">Anti-cheat rate limit flags</div>
              </div>
            </div>
          )}

          {/* Dynamic Configuration Form */}
          {economyConfig && (
            <form onSubmit={handleUpdateConfig} className="p-6 rounded-2xl bg-slate-900/80 border border-purple-500/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-400" />
                  DYNAMIC SERVER ECONOMY PARAMETERS
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  Real-time adjustments without rebuild
                </span>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Economy parameters updated and persisted to server store!
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-slate-300">Mission Base Credits</label>
                  <input
                    type="number"
                    value={economyConfig.missionCompletionCredits}
                    onChange={(e) =>
                      setEconomyConfig({ ...economyConfig, missionCompletionCredits: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300">Boss Bounty Credits</label>
                  <input
                    type="number"
                    value={economyConfig.bossCompletionCredits}
                    onChange={(e) =>
                      setEconomyConfig({ ...economyConfig, bossCompletionCredits: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300">3-Star Bonus Credits</label>
                  <input
                    type="number"
                    value={economyConfig.threeStarBonusCredits}
                    onChange={(e) =>
                      setEconomyConfig({ ...economyConfig, threeStarBonusCredits: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300">Max Ads / Day Cap</label>
                  <input
                    type="number"
                    value={economyConfig.rewardedAds.maxRewardedAdsPerDay}
                    onChange={(e) =>
                      setEconomyConfig({
                        ...economyConfig,
                        rewardedAds: { ...economyConfig.rewardedAds, maxRewardedAdsPerDay: Number(e.target.value) },
                      })
                    }
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300">Ad Cooldown (Seconds)</label>
                  <input
                    type="number"
                    value={economyConfig.rewardedAds.minSecondsBetweenRewardedAds}
                    onChange={(e) =>
                      setEconomyConfig({
                        ...economyConfig,
                        rewardedAds: {
                          ...economyConfig.rewardedAds,
                          minSecondsBetweenRewardedAds: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300">Max Revives Per Sortie</label>
                  <input
                    type="number"
                    value={economyConfig.rewardedAds.maxRevivesPerMission}
                    onChange={(e) =>
                      setEconomyConfig({
                        ...economyConfig,
                        rewardedAds: { ...economyConfig.rewardedAds, maxRevivesPerMission: Number(e.target.value) },
                      })
                    }
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold font-display text-xs cursor-pointer transition-all shadow-lg shadow-purple-500/20"
                >
                  Save Authoritative Economy Config
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
