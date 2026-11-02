/**
 * Centralized Game Configuration
 * Evaluation requirement: VITE_GAME_NAME is the single source of truth for the frontend.
 */

export const GAME_NAME = (import.meta.env.VITE_GAME_NAME as string) || "SPACE SHOOTER ODYSSEY";
export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || "/api";

export const CURRENCIES = {
  CREDITS: "Credits",
  ENERGY_CORES: "Energy Cores",
  XP: "XP",
  VELOOP_COINS: "VELoop Reward Coins",
} as const;

export const SECTORS = [
  {
    id: "orion-frontier",
    name: "Sector 1: Orion Frontier",
    color: "#38bdf8",
    description: "Outer perimeter patrol zones. Hostile scouts and pirate interceptors detected.",
    missionsRange: [1, 10],
    bossName: "The Iron Warden",
    bossMissionId: 10,
    bgGradient: "from-slate-950 via-sky-950/40 to-slate-950",
  },
  {
    id: "crimson-nebula",
    name: "Sector 2: Crimson Nebula",
    color: "#f43f5e",
    description: "Volatile ionized plasma storm harboring deadly serpentine alien bio-ships.",
    missionsRange: [11, 20],
    bossName: "Nebula Serpent",
    bossMissionId: 20,
    bgGradient: "from-slate-950 via-rose-950/40 to-slate-950",
  },
  {
    id: "frozen-expanse",
    name: "Sector 3: Frozen Expanse",
    color: "#a855f7",
    description: "Sub-zero crystalline asteroid belts guarded by ancient solar energy harvesters.",
    missionsRange: [21, 30],
    bossName: "Solar Devourer",
    bossMissionId: 30,
    bgGradient: "from-slate-950 via-purple-950/40 to-slate-950",
  },
  {
    id: "rift-territory",
    name: "Sector 4: Rift Territory",
    color: "#eab308",
    description: "Torn fabric of spacetime crawling with warp carriers and heavy cruisers.",
    missionsRange: [31, 40],
    bossName: "The Rift Carrier",
    bossMissionId: 40,
    bgGradient: "from-slate-950 via-amber-950/40 to-slate-950",
  },
  {
    id: "void-citadel",
    name: "Sector 5: Void Citadel",
    color: "#10b981",
    description: "The core fortress of the Void Emperor. Extreme danger, bullet-hell boss encounters.",
    missionsRange: [41, 50],
    bossName: "Void Emperor",
    bossMissionId: 50,
    bgGradient: "from-slate-950 via-emerald-950/40 to-slate-950",
  },
];
