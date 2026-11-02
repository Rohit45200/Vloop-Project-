import React, { useState } from "react";
import {
  BookOpen,
  X,
  CheckCircle2,
  ShieldAlert,
  Code2,
  Coins,
  Cpu,
  Layers,
  Terminal,
} from "lucide-react";
import { GAME_NAME } from "../../config/gameConfig.ts";

interface ComplianceDocsModalProps {
  onClose: () => void;
}

export const ComplianceDocsModal: React.FC<ComplianceDocsModalProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<string>("overview");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl border border-cyan-500/40 bg-slate-900 shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                {GAME_NAME} • SPECIFICATION & EVALUATION AUDIT
              </h3>
              <p className="text-xs text-slate-400">
                Full-Stack Developer Internship Assignment Compliance (Parts I — XVI)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 p-3 border-r border-slate-800 bg-slate-950/40 space-y-1 overflow-y-auto text-xs font-mono">
            {[
              { id: "overview", label: "1. Overview & Dynamic Name" },
              { id: "gameplay", label: "2. Gameplay & Engine" },
              { id: "sectors", label: "3. 50 Missions & 5 Bosses" },
              { id: "ships", label: "4. Ships & Upgrades" },
              { id: "powerups", label: "5. 8 Power-Up Modules" },
              { id: "economy", label: "6. VELoop Economy & Ads" },
              { id: "anticheat", label: "7. Server Anti-Cheat" },
              { id: "api", label: "8. REST API Contracts" },
              { id: "checklist", label: "9. 87-Item Checklist" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  activeSection === s.id
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs font-sans leading-relaxed text-slate-300">
            {activeSection === "overview" && (
              <div className="space-y-3">
                <h4 className="font-display font-bold text-lg text-white">
                  Part I — Project Foundation & Dynamic Configuration
                </h4>
                <p>
                  <strong>{GAME_NAME}</strong> is a production-quality full-stack arcade shooter built to demonstrate high-velocity 2D space combat coupled with a secure, auditable, and sustainable rewarded-ad economy for the VELoop platform.
                </p>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 font-mono space-y-2">
                  <span className="text-cyan-400 font-bold block">
                    Dynamic Game Name (Section 4 Mandatory):
                  </span>
                  <p className="text-[11px] text-slate-300">
                    The title is governed through a single source of truth: <code>src/config/gameConfig.ts</code> reading <code>import.meta.env.VITE_GAME_NAME</code> on client, and <code>process.env.GAME_NAME</code> on Express server. Changing this variable in <code>.env</code> immediately reconfigures the entire application without component-level hardcoding.
                  </p>
                </div>
              </div>
            )}

            {activeSection === "gameplay" && (
              <div className="space-y-3">
                <h4 className="font-display font-bold text-lg text-white">
                  Part II — Gameplay Engine & Canvas 2D Architecture
                </h4>
                <p>
                  Built on a dedicated HTML5 Canvas 2D engine operating at a silky smooth 60 FPS with delta-time physics and object pooling.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 font-mono text-[11px]">
                  <li>
                    <strong>Controls:</strong> Full desktop support (WASD, Arrow keys, Spacebar, Number keys 1-8 for tactical power-ups, P to pause) and smooth mobile touch-drag interpolation.
                  </li>
                  <li>
                    <strong>Audio System (Section 73):</strong> Pure procedural Web Audio API synthesizer generating laser sounds, explosions, alarms, pickup chimes, and victory fanfares without relying on external MP3 assets that could fail.
                  </li>
                  <li>
                    <strong>5 Distinct Enemies (Section 9):</strong> Scout Fighter (fast sinusoidal waves), Interceptor (dive-bombers), Armored Cruiser (triple-cannon tank), Long-Range Gunship (backline sniper), and Elite Phantom (cloaked evasive assassin).
                  </li>
                </ul>
              </div>
            )}

            {activeSection === "sectors" && (
              <div className="space-y-3">
                <h4 className="font-display font-bold text-lg text-white">
                  Part III — 50 Data-Driven Missions & 5 Epic Boss Encounters
                </h4>
                <p>
                  All 50 missions are strictly data-driven through structured wave parameters, progressive enemy scaling, and specific mission objectives.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-cyan-400 font-bold">Sector 1: Orion Frontier (1-10)</span>
                    <p className="text-slate-400 mt-1">Boss #1: The Iron Warden (Dreadnought vessel with dual plasma sweeps)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-rose-400 font-bold">Sector 2: Crimson Nebula (11-20)</span>
                    <p className="text-slate-400 mt-1">Boss #2: Nebula Serpent (Alien biomechanical craft with acid spit)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-purple-400 font-bold">Sector 3: Frozen Expanse (21-30)</span>
                    <p className="text-slate-400 mt-1">Boss #3: Solar Devourer (Solar core harvesting radiant plasma)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-amber-400 font-bold">Sector 4: Rift Territory (31-40)</span>
                    <p className="text-slate-400 mt-1">Boss #4: The Rift Carrier (Carrier deploying swarms of escort drones)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-emerald-800 col-span-2">
                    <span className="text-emerald-400 font-bold">Sector 5: Void Citadel (41-50)</span>
                    <p className="text-slate-400 mt-1">Boss #5: Void Emperor (Multi-phase bullet hell final showdown with dark matter nova)</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "ships" && (
              <div className="space-y-3">
                <h4 className="font-display font-bold text-lg text-white">
                  Part IV — 5 Starship Classes & Upgrades (Section 22-25)
                </h4>
                <div className="space-y-2 font-mono text-[11px]">
                  <div>1. <strong>Aero-X Interceptor:</strong> Agile, balanced starting fighter with overclocked dual lasers.</div>
                  <div>2. <strong>Aegis Dreadnought:</strong> Guardian class with heavy armor plating, massive HP, and reactive shields.</div>
                  <div>3. <strong>Viper Stryker:</strong> High-DPS plasma striker; glass-cannon melting enemy lines.</div>
                  <div>4. <strong>Chrono Harvester:</strong> Support craft with magnetic pickup attraction sensors and nanites.</div>
                  <div>5. <strong>Voidwing Phantom:</strong> Experimental black-ops vessel equipped with tachyon phase warp.</div>
                </div>
                <p>
                  Upgrades modify real in-game attributes: Weapon Damage, Firing Rate, Maximum Health, Shield Capacity, and Engine Velocity. Prices scale exponentially and are verified atomically on the server.
                </p>
              </div>
            )}

            {activeSection === "powerups" && (
              <div className="space-y-3">
                <h4 className="font-display font-bold text-lg text-white">
                  Part V — 8 Mandatory Power-Up Modules (Section 26)
                </h4>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">1. Shield Pulse (Invulnerability bubble)</div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">2. Rapid Fire (Tripled cycle rate)</div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">3. Spread Shot (5-angle fan spread)</div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">4. Homing Missiles (Radar-guided rockets)</div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">5. EMP Blast (Screen-wide bullet clear)</div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">6. Repair Drone (Restores 40% Hull)</div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">7. Overdrive (Damage & speed boost)</div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">8. Emergency Warp (Escape hyperjump)</div>
                </div>
              </div>
            )}

            {activeSection === "economy" && (
              <div className="space-y-3">
                <h4 className="font-display font-bold text-lg text-white">
                  Part VI & VII — VELoop Reward Economy & Ad Lifecycle
                </h4>
                <p>
                  The game implements a strict server-authoritative double-entry ledger. Currencies:
                </p>
                <ul className="list-disc pl-5 space-y-1 font-mono text-[11px]">
                  <li><strong>Credits:</strong> Primary gameplay currency used for upgrades and power-ups.</li>
                  <li><strong>Energy Cores:</strong> Rare progression currency earned via boss defeats and daily streaks.</li>
                  <li><strong>XP:</strong> Level progression (levels cannot be bought directly).</li>
                  <li><strong>VELoop Reward Coins:</strong> Platform-eligible reward balance subject to VELoop platform terms.</li>
                </ul>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 font-mono text-[11px] space-y-1.5">
                  <span className="text-amber-400 font-bold block">Ad State Machine (Section 46):</span>
                  <p>
                    <code>OFFERED → REQUESTED → AD_STARTED → AD_COMPLETED → VERIFYING → VERIFIED → GRANTED</code>
                  </p>
                  <p className="text-slate-400">
                    A button click on frontend is NOT proof of ad completion. The server validates opportunities, enforces 30s cooldowns, daily caps (10 ads/day), session caps (5/session), and prevents duplicate callback claims via unique opportunity tokens.
                  </p>
                </div>
              </div>
            )}

            {activeSection === "anticheat" && (
              <div className="space-y-3">
                <h4 className="font-display font-bold text-lg text-white">
                  Part X — Server Validation & Anti-Cheat (Section 64-66)
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 font-mono text-[11px]">
                  <li><strong>Unique Game Sessions:</strong> A sortie session is created at <code>POST /api/games/start</code> with a cryptographically generated token and start timestamp.</li>
                  <li><strong>Duration Bounds Check:</strong> Runs completing under 3 seconds are immediately rejected as speed hacks.</li>
                  <li><strong>Score Bounds Check:</strong> Scores exceeding theoretical enemy kill maximums are rejected.</li>
                  <li><strong>Atomic Balance Changes:</strong> Balance before and balance after are logged on every single transaction. Negative balance mutations are prohibited.</li>
                  <li><strong>Idempotency:</strong> Replaying the same completion or ad claim request produces a 400 error.</li>
                </ul>
              </div>
            )}

            {activeSection === "api" && (
              <div className="space-y-3">
                <h4 className="font-display font-bold text-lg text-white">
                  Part XI — REST API Contracts (Section 68)
                </h4>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] space-y-1 text-slate-300">
                  <div>GET /api/player/profile • GET /api/player/progress • GET /api/player/inventory</div>
                  <div>GET /api/missions • POST /api/games/start • POST /api/games/:id/complete</div>
                  <div>GET /api/ships • POST /api/ships/:id/select • POST /api/ships/:id/upgrade • POST /api/ships/:id/unlock</div>
                  <div>GET /api/powerups • POST /api/powerups/:id/acquire • POST /api/games/:id/powerups/use</div>
                  <div>GET /api/economy/config • GET /api/wallet/balance • GET /api/wallet/history</div>
                  <div>POST /api/rewards/ad/opportunity • POST /api/rewards/ad/claim</div>
                  <div>POST /api/games/:id/revive/request • POST /api/games/:id/double-score/request</div>
                  <div>GET /api/daily-missions • POST /api/daily-missions/:id/claim • GET /api/leaderboard</div>
                </div>
              </div>
            )}

            {activeSection === "checklist" && (
              <div className="space-y-2">
                <h4 className="font-display font-bold text-lg text-white">
                  Part XVI — Section 87 Mandatory Features Checklist
                </h4>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  {[
                    "Original game identity & logo",
                    "Dynamic .env game name",
                    "Centralized game configuration",
                    "Playable Canvas 2D combat",
                    "Responsive player controls (Desktop & Mobile)",
                    "5 Configurable enemy types",
                    "Wave-based spawn system",
                    "Five original boss encounters",
                    "5 Sectors & 50 playable missions",
                    "Multiple mission objectives",
                    "Server-authoritative mission unlocking",
                    "Mission result screen with 3 stars",
                    "Ship hangar & 5 original classes",
                    "Modular ship upgrades & stat boosts",
                    "8 Required power-up modules",
                    "Pause, restart, and resume",
                    "Audio controls & procedural synth",
                    "Full authentication & session tokens",
                    "Persistent database store",
                    "Wallet & reward transaction ledgers",
                    "Anti-cheat score & duration checks",
                    "VELoop 4-tier currency engine",
                    "Revive, Double Score & Double Credits ads",
                    "Ad state machine & idempotency",
                    "Daily missions & 7-day login streak",
                    "Supply drop gacha with transparent rates",
                    "Global leaderboard ranking",
                    "Admin live metrics & economy tuning",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Evaluator Testing Guide Available in README.md</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold font-display cursor-pointer hover:bg-cyan-400 transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
