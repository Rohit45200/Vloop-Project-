# SPACE SHOOTER ODYSSEY
### Full-Stack Space Combat Game + Gamification + VELoop Rewarded-Ad Economy
**Internship Assignment Domain:** Full-Stack Game Development  
**Configurable Game Title:** `SPACE SHOOTER ODYSSEY` (Single source of truth via environment variables)

---

## 1. Project Overview
**SPACE SHOOTER ODYSSEY** is an original production-grade full-stack space arcade shooter engineered with a high-performance Canvas 2D combat engine, paired with an authoritative server-side economy and rewarded advertising architecture built for **VELoop Rewards**.

The game features:
- **50 Data-Driven Missions** across **5 Sectors** (Orion Frontier, Crimson Nebula, Frozen Expanse, Rift Territory, Void Citadel).
- **5 Epic Boss Battles** with multi-phase mechanics, telegraphed attacks, and custom health tracking.
- **5 Starship Classes** (Aero-X Interceptor, Aegis Dreadnought, Viper Stryker, Chrono Harvester, Voidwing Phantom) with 5 modular upgrade attributes.
- **8 Mandatory Tactical Power-Ups** (Shield Pulse, Rapid Fire, Spread Shot, Homing Missiles, EMP Blast, Repair Drone, Overdrive, Emergency Warp).
- **Procedural Web Audio Engine** for high-fidelity lasers, explosions, alarms, and musical synth feedback without fragile external media assets.
- **Authoritative 4-Tier Economy**: Credits, Energy Cores, XP, and VELoop Reward Coins.
- **VELoop Rewarded-Ad State Machine**: Verified Revive, Double Score, Double Credits, and Emergency Boosters with rate-limiting, daily caps, and anti-fraud idempotency.
- **Player Retention Hub**: 7-Day Login Streak, 3 Daily Flight Orders, Orbital Supply Drop Gacha, 10 Badges & Achievements, and Global Leaderboard.
- **Admin Economy Controls & Audit Metrics**: Live server-side configuration tweaking without rebuild.

---

## 2. Dynamic Game Name Configuration (Section 4 Mandatory)
To satisfy the evaluation requirement where an evaluator can change the title to *GALAXY COMMANDER* or *STAR PILOT ODYSSEY*:
- **Frontend Configuration:** `src/config/gameConfig.ts` exports `GAME_NAME = import.meta.env.VITE_GAME_NAME || "SPACE SHOOTER ODYSSEY"`.
- **Backend Configuration:** `server.ts` references `process.env.GAME_NAME || process.env.VITE_GAME_NAME || "SPACE SHOOTER ODYSSEY"`.
- **Dynamic Usage:** Title and meta tags in `index.html`, Cockpit UI, Hangar, Audit screens, Leaderboard, and emails use this single centralized constant.

---

## 3. Original Design Decisions & Reference Research
Unlike the reference mobile game (*Space Shooter 2*), our project was engineered with an original aesthetic, modern web standards, and robust economic guardrails:
1. **Zero-Asset Dependency Audio:** Implemented an in-engine procedural audio synthesizer using the HTML5 Web Audio API. Lasers, explosions, shield harmonics, and UI clicks synthesize mathematically on the fly.
2. **Hybrid Full-Stack Engine:** Fast Canvas 2D engine decoupled from React state during active 60 FPS combat loops to avoid React render churn. React handles the HUD, modal dialogs, hangar, and economy ledger.
3. **Double-Entry Wallet Ledger:** Every credit or coin mutation is logged in an atomic database record containing `balanceBefore`, `balanceAfter`, `source`, `referenceId`, and timestamp.
4. **Idempotent Ad Verification:** Client button clicks cannot grant rewards. A signed server-side session opportunity token is verified prior to committing currency.

---

## 4. Gameplay & Controls
### Desktop Controls
- **Movement:** `W, A, S, D` or `Arrow Keys` (smooth velocity interpolation, clamped inside screen bounds).
- **Firing:** Automatic continuous plasma fire (or Spacebar / Left Click).
- **Power-Ups (Quick Slots 1–8):**
  - `1`: Shield Pulse (Immunity bubble)
  - `2`: Rapid Fire (3x cycle rate)
  - `3`: Spread Shot (5-way plasma spread)
  - `4`: Homing Missiles (Radar tracking)
  - `5`: EMP Blast (Screen-wide bullet clearance)
  - `6`: Repair Drone (Hull restoration)
  - `7`: Overdrive (Speed + DPS boost)
  - `8`: Emergency Warp (Phase evasive jump)
- **Pause & Resume:** `P` key or HUD Pause button.

### Mobile Controls
- **Touch Drag:** Responsive touch dragging directly steers the starship.
- **Touch Ability Bar:** Bottom quick buttons with active cooldown indicators and stock counters.

---

## 5. Campaign & Sector Progression (50 Missions, 5 Bosses)
1. **Sector 1: Orion Frontier (Sorties 1–10)**  
   *Hostile scouts and interceptors.*  
   **Boss 1 (Mission 10): The Iron Warden** — Armored dreadnought with dual heavy plasma sweeps and missile salvos.
2. **Sector 2: Crimson Nebula (Sorties 11–20)**  
   *Volatile plasma clouds harboring alien bio-ships.*  
   **Boss 2 (Mission 20): Nebula Serpent** — Undulating alien craft spitting acidic spread fire.
3. **Sector 3: Frozen Expanse (Sorties 21–30)**  
   *Sub-zero asteroid fields.*  
   **Boss 3 (Mission 30): Solar Devourer** — Radiant star-core enemy with rotating spiral solar flares.
4. **Sector 4: Rift Territory (Sorties 31–40)**  
   *Spacetime fractures and heavy battlecruisers.*  
   **Boss 4 (Mission 40): The Rift Carrier** — Spawns escort drone swarms and quantum broadside lasers.
5. **Sector 5: Void Citadel (Sorties 41–50)**  
   *Core fortress of the Void Empire.*  
   **Boss 5 (Mission 50): Void Emperor** — 3-phase bullet-hell final encounter with dark matter novae and tachyon storms.

---

## 6. Ship Classes & Upgrades (Section 22–25)
1. **Aero-X Interceptor:** Balanced starting fighter with high speed.
2. **Aegis Dreadnought (Guardian):** High armor and shield capacity; absorbs massive kinetic damage.
3. **Viper Stryker (Striker):** Devastating burst damage; glass-cannon DPS.
4. **Chrono Harvester (Support):** Utility tractor beam with nanite repair fields.
5. **Voidwing Phantom (Experimental):** Tachyon singularity weapons unlocked via progression.

**Upgrades:** Damage, Firing Rate, Hull Health, Shield Capacity, Thruster Speed (up to Tier 10). Costs increase mathematically on the server.

---

## 7. Economy & VELoop Rewarded Ads Architecture (Section 30–51)
### 4 Currencies
- **Credits:** Standard spendable currency (earned via sorties, used for upgrades and power-ups).
- **Energy Cores:** Rare progression currency (earned via boss kills, 7-day streaks, and supply drops).
- **XP:** Player pilot rank progression.
- **VELoop Reward Coins:** Platform-backed rewarded balance.

### Rewarded Ad Placements
1. **Revive after Defeat:** Restores 50% Hull at current wave checkpoint (capped at 1 per sortie).
2. **Double Score on Victory:** Applies a 2x multiplier to mission combat score.
3. **Double Credits on Victory:** Doubles the base mission credit reward.
4. **Emergency Shield & Power-Up:** Grants free combat modules.
5. **Daily Bonus Multiplier:** Boosts daily login rewards.

### Ad State Machine
`OFFERED → REQUESTED → AD_STARTED → AD_COMPLETED → VERIFYING → VERIFIED → GRANTED`
- Enforces minimum 30-second cooldown between ads.
- Enforces daily cap of 10 rewarded ads per pilot.
- Prevents duplicated reward claims through cryptographic token validation.

---

## 8. Server Anti-Cheat & Security Controls (Section 64–66)
1. **Server-Generated Session Lifecycle:** Client requests `POST /api/games/start` before entering combat; server returns a session ID and validation token.
2. **Duration Bounds Validation:** Missions completed under 3 seconds are rejected as impossible speed hacks.
3. **Theoretical Score Validation:** Scores that exceed the maximum possible points for the spawned enemy count are rejected.
4. **Atomic Transactions:** Deductions verify sufficient funds before committing. Negative balances are rejected.
5. **Idempotency Protection:** Duplicate requests with previously claimed session IDs or opportunity IDs return 400 Bad Request.

---

## 9. API Documentation (Section 68)
- `POST /api/auth/register` — Register pilot callsign, email, and password.
- `POST /api/auth/login` — Authenticate and receive session token.
- `GET /api/auth/me` — Retrieve active pilot state.
- `GET /api/player/progress` — Get missions, ships, wallet, and inventory.
- `GET /api/player/history` — Get double-entry wallet and reward transaction ledgers.
- `GET /api/missions` — Retrieve all 50 data-driven mission definitions.
- `POST /api/games/start` — Initialize an authoritative sortie session.
- `POST /api/games/:sessionId/complete` — Validate sortie outcome and grant rewards.
- `GET /api/ships` & `POST /api/ships/:shipId/upgrade` — Inspect and upgrade vessels.
- `GET /api/economy/config` — Get current server-controlled economic parameters.
- `POST /api/rewards/ad/opportunity` — Request an ad verification token.
- `POST /api/rewards/ad/claim` — Authoritatively verify and commit ad reward.
- `POST /api/games/:sessionId/revive/request` — Sortie revive verification.
- `GET /api/daily-missions` & `POST /api/daily-missions/:id/claim` — Daily flight orders.
- `POST /api/player/daily-login/claim` — 7-Day login streak claim.
- `POST /api/player/supply-drop/claim` — Open orbital supply drop crate.
- `GET /api/leaderboard` — Galactic pilot rankings.
- `GET /api/admin/metrics` & `PUT /api/admin/economy` — Admin audit dashboard.

---

## 10. Local Setup & Testing Instructions
### Prerequisites
- Node.js 18+ and npm installed.

### Setup Commands
```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (optional, defaults provided)
cp .env.example .env

# 3. Start full-stack development server (Express + Vite)
npm run dev

# 4. Build for production deployment
npm run build
npm start
```

### Pre-Seeded Pilot Credentials
- **Callsign:** `Commander Nova`
- **Email:** `pilot@veloop.io`
- **Password:** `pilot123`
- **Role:** Administrator (Access to Admin Audit panel)
- *Or click "Quick Demo Login" on the authorization screen to test immediately.*
