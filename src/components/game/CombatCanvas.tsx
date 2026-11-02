import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Shield,
  Zap,
  Flame,
  Crosshair,
  Radio,
  Wrench,
  Activity,
  Sparkles,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { audio } from "../../services/audioService.ts";

export interface CombatCanvasProps {
  mission: any;
  shipDef: any;
  shipState: any;
  inventory: Record<string, number>;
  onVictory: (stats: {
    score: number;
    enemiesKilled: number;
    bossKilled: boolean;
    powerUpsUsed: number;
    accuracy: number;
    durationSec: number;
  }) => void;
  onDefeat: (stats: { score: number; waveReached: number; canRevive: boolean }) => void;
  onExit: () => void;
  onRequestRevive: () => void;
  revivedSignal?: number; // increments when revived
}

interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
  alpha: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  isPlayer: boolean;
  color: string;
  size: number;
  isHoming?: boolean;
  target?: Enemy | null;
}

interface Pickup {
  x: number;
  y: number;
  type: "credits" | "core" | "shield" | "repair" | "weapon";
  label: string;
  color: string;
  vy: number;
}

interface Enemy {
  id: string;
  type: "scout" | "interceptor" | "armored_cruiser" | "gunship" | "elite" | "boss";
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  speed: number;
  scoreValue: number;
  color: string;
  lastFireTime: number;
  fireInterval: number;
  angle?: number;
  phase?: number;
  telegraphTime?: number; // for boss charge attacks
  bossName?: string;
}

export const CombatCanvas: React.FC<CombatCanvasProps> = ({
  mission,
  shipDef,
  shipState,
  inventory,
  onVictory,
  onDefeat,
  onExit,
  onRequestRevive,
  revivedSignal = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic Upgraded Ship Stats
  const upgrades = shipState?.upgrades || { damage: 0, fireRate: 0, health: 0, speed: 0, shield: 0 };
  const maxHealth = Math.round(shipDef.baseStats.health * (1 + (upgrades.health || 0) * 0.15));
  const maxShield = Math.round(shipDef.baseStats.shield * (1 + (upgrades.shield || 0) * 0.15));
  const shipSpeed = Math.round(shipDef.baseStats.speed * (1 + (upgrades.speed || 0) * 0.08));
  const baseDamage = Math.round(shipDef.baseStats.damage * (1 + (upgrades.damage || 0) * 0.15));
  const baseFireRate = shipDef.baseStats.fireRate * (1 + (upgrades.fireRate || 0) * 0.1);

  // In-Game Live State
  const [health, setHealth] = useState(maxHealth);
  const [shield, setShield] = useState(maxShield);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [totalWaves] = useState(mission.waves.length || 3);
  const [isPaused, setIsPaused] = useState(false);
  const [waveAnnouncement, setWaveAnnouncement] = useState<string>(`Wave 1 / ${mission.waves.length}`);
  const [bossHealth, setBossHealth] = useState<{ current: number; max: number; name: string } | null>(null);
  const [activeBuffs, setActiveBuffs] = useState<Record<string, number>>({});
  const [shotsFired, setShotsFired] = useState(0);
  const [shotsHit, setShotsHit] = useState(0);

  // Power-up cooldowns and local stock
  const [localInventory, setLocalInventory] = useState<Record<string, number>>({ ...inventory });
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  // Refs for loop
  const gameStateRef = useRef({
    player: {
      x: 300,
      y: 650,
      vx: 0,
      vy: 0,
      width: 44,
      height: 48,
      health: maxHealth,
      shield: maxShield,
      invulnerableUntil: 0,
    },
    keys: {} as Record<string, boolean>,
    touch: { active: false, x: 0, y: 0 },
    lastShootTime: 0,
    stars: [] as Star[],
    particles: [] as Particle[],
    projectiles: [] as Projectile[],
    pickups: [] as Pickup[],
    enemies: [] as Enemy[],
    activeBuffs: {} as Record<string, number>, // effect -> expiryTime
    currentWaveIndex: 0,
    waveSpawned: false,
    startTime: Date.now(),
    enemiesKilled: 0,
    bossKilled: false,
    powerUpsUsedCount: 0,
    shotsFiredCount: 0,
    shotsHitCount: 0,
    scoreValue: 0,
    gameOver: false,
  });

  // Handle Revive Signal
  useEffect(() => {
    if (revivedSignal > 0) {
      const gs = gameStateRef.current;
      gs.gameOver = false;
      gs.player.health = Math.round(maxHealth * 0.6);
      gs.player.shield = maxShield;
      gs.player.invulnerableUntil = Date.now() + 3500;
      setHealth(gs.player.health);
      setShield(gs.player.shield);
      audio.playShield();
    }
  }, [revivedSignal, maxHealth, maxShield]);

  // Activate Power-Up
  const activatePowerUp = useCallback((powerId: string) => {
    const gs = gameStateRef.current;
    if (gs.gameOver) return;

    const count = localInventory[powerId] || 0;
    if (count <= 0) return;

    const now = Date.now();
    if (cooldowns[powerId] && cooldowns[powerId] > now) return;

    audio.playShield();
    gs.powerUpsUsedCount++;

    setLocalInventory((prev) => ({ ...prev, [powerId]: prev[powerId] - 1 }));

    let cd = 20000;
    let dur = 7000;

    if (powerId === "shield-pulse") {
      gs.activeBuffs["shield-pulse"] = now + 8000;
      gs.player.shield = maxShield;
      setShield(maxShield);
      cd = 22000;
      dur = 8000;
    } else if (powerId === "rapid-fire") {
      gs.activeBuffs["rapid-fire"] = now + 8000;
      cd = 18000;
      dur = 8000;
    } else if (powerId === "spread-shot") {
      gs.activeBuffs["spread-shot"] = now + 9000;
      cd = 20000;
      dur = 9000;
    } else if (powerId === "homing-missiles") {
      // Launch 4 tracking missiles
      for (let i = 0; i < 4; i++) {
        gs.projectiles.push({
          x: gs.player.x + (i % 2 === 0 ? -15 : 15),
          y: gs.player.y - 10,
          vx: (Math.random() - 0.5) * 4,
          vy: -6,
          damage: baseDamage * 2.2,
          isPlayer: true,
          color: "#f59e0b",
          size: 6,
          isHoming: true,
        });
      }
      cd = 20000;
      dur = 1000;
    } else if (powerId === "emp-blast") {
      // Screen-wide blast!
      audio.playExplosion(true);
      gs.projectiles = gs.projectiles.filter((p) => p.isPlayer);
      gs.enemies.forEach((e) => {
        e.health -= baseDamage * 3;
      });
      // Shockwave particles
      for (let i = 0; i < 60; i++) {
        const ang = (i / 60) * Math.PI * 2;
        gs.particles.push({
          x: gs.player.x,
          y: gs.player.y,
          vx: Math.cos(ang) * 9,
          vy: Math.sin(ang) * 9,
          life: 40,
          maxLife: 40,
          color: "#38bdf8",
          size: 4,
        });
      }
      cd = 28000;
      dur = 1500;
    } else if (powerId === "repair-drone") {
      gs.player.health = Math.min(maxHealth, gs.player.health + Math.round(maxHealth * 0.4));
      setHealth(gs.player.health);
      audio.playPickup();
      cd = 25000;
      dur = 2000;
    } else if (powerId === "overdrive") {
      gs.activeBuffs["overdrive"] = now + 10000;
      cd = 30000;
      dur = 10000;
    } else if (powerId === "emergency-warp") {
      gs.player.x = 100 + Math.random() * 400;
      gs.player.y = 500 + Math.random() * 200;
      gs.player.invulnerableUntil = now + 2500;
      audio.playPickup();
      cd = 32000;
      dur = 2500;
    }

    setCooldowns((prev) => ({ ...prev, [powerId]: now + cd }));
    setActiveBuffs({ ...gs.activeBuffs });
  }, [localInventory, cooldowns, maxHealth, maxShield, baseDamage]);

  // Main Canvas Setup & Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Starfield initialization
    const stars: Star[] = [];
    for (let i = 0; i < 90; i++) {
      stars.push({
        x: Math.random() * 600,
        y: Math.random() * 800,
        speed: 0.5 + Math.random() * 2.5,
        size: Math.random() < 0.2 ? 2.5 : 1.2,
        alpha: 0.3 + Math.random() * 0.7,
      });
    }
    gameStateRef.current.stars = stars;
    gameStateRef.current.player.x = canvas.width / 2;
    gameStateRef.current.player.y = canvas.height - 100;

    // Keyboard Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key.toLowerCase()] = true;
      if (e.key === "p" || e.key === "P") {
        setIsPaused((p) => !p);
      }
      // Quick slot numbers 1 to 8
      if (e.key === "1") activatePowerUp("shield-pulse");
      if (e.key === "2") activatePowerUp("rapid-fire");
      if (e.key === "3") activatePowerUp("spread-shot");
      if (e.key === "4") activatePowerUp("homing-missiles");
      if (e.key === "5") activatePowerUp("emp-blast");
      if (e.key === "6") activatePowerUp("repair-drone");
      if (e.key === "7") activatePowerUp("overdrive");
      if (e.key === "8") activatePowerUp("emergency-warp");
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Touch / Mouse controls for direct responsive movement
    const getCanvasPos = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      const pos = getCanvasPos(t.clientX, t.clientY);
      gameStateRef.current.touch = { active: true, x: pos.x, y: pos.y };
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!gameStateRef.current.touch.active) return;
      const t = e.touches[0];
      const pos = getCanvasPos(t.clientX, t.clientY);
      gameStateRef.current.touch.x = pos.x;
      gameStateRef.current.touch.y = pos.y;
    };

    const handleTouchEnd = () => {
      gameStateRef.current.touch.active = false;
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);

    // Start background space ambient music
    audio.startBGM();

    let animationFrameId: number;
    let lastTime = performance.now();

    // Helper: Spawn Enemy Waves
    const spawnCurrentWave = () => {
      const gs = gameStateRef.current;
      const currentWaveData = mission.waves[gs.currentWaveIndex];
      if (!currentWaveData) return;

      setWave(gs.currentWaveIndex + 1);
      setWaveAnnouncement(`Sector Wave ${gs.currentWaveIndex + 1} of ${mission.waves.length}`);
      setTimeout(() => setWaveAnnouncement(""), 2200);

      const isFinalWave = gs.currentWaveIndex === mission.waves.length - 1;

      // Check if boss spawns
      if (isFinalWave && mission.bossId) {
        audio.playBossAlarm();
        const bossMaxHp = 800 + mission.id * 120;
        const bossEnemy: Enemy = {
          id: "boss_" + Date.now(),
          type: "boss",
          x: canvas.width / 2,
          y: 110,
          width: 80,
          height: 70,
          health: bossMaxHp,
          maxHealth: bossMaxHp,
          speed: 1.2,
          scoreValue: 5000 + mission.id * 500,
          color: "#a855f7",
          lastFireTime: Date.now(),
          fireInterval: 1200,
          angle: 0,
          phase: 1,
          bossName: mission.title.replace("Showdown: ", ""),
        };
        gs.enemies.push(bossEnemy);
        setBossHealth({ current: bossMaxHp, max: bossMaxHp, name: bossEnemy.bossName || "Boss Dreadnought" });
      }

      // Spawn regular wave enemies
      currentWaveData.enemies.forEach((grp: any, gIdx: number) => {
        for (let i = 0; i < grp.count; i++) {
          const spacing = canvas.width / (grp.count + 1);
          let hp = 30 + mission.id * 6;
          let spd = 2;
          let col = "#38bdf8";
          let scoreVal = 100;
          let fireInt = 2000;

          if (grp.type === "interceptor") {
            hp = 45 + mission.id * 8;
            spd = 2.8;
            col = "#f43f5e";
            scoreVal = 160;
            fireInt = 1600;
          } else if (grp.type === "armored_cruiser") {
            hp = 120 + mission.id * 15;
            spd = 1.2;
            col = "#eab308";
            scoreVal = 280;
            fireInt = 2400;
          } else if (grp.type === "gunship") {
            hp = 80 + mission.id * 10;
            spd = 1.6;
            col = "#06b6d4";
            scoreVal = 220;
            fireInt = 1800;
          } else if (grp.type === "elite") {
            hp = 200 + mission.id * 20;
            spd = 2.4;
            col = "#c084fc";
            scoreVal = 500;
            fireInt = 1400;
          }

          gs.enemies.push({
            id: `en_${Date.now()}_${gIdx}_${i}`,
            type: grp.type,
            x: spacing * (i + 1) + (Math.random() - 0.5) * 30,
            y: -40 - i * 40 - gIdx * 70,
            width: grp.type === "armored_cruiser" ? 44 : 32,
            height: grp.type === "armored_cruiser" ? 40 : 30,
            health: hp,
            maxHealth: hp,
            speed: spd,
            scoreValue: scoreVal,
            color: col,
            lastFireTime: Date.now() + Math.random() * 1500,
            fireInterval: fireInt,
            angle: 0,
          });
        }
      });

      gs.waveSpawned = true;
    };

    // GAME LOOP
    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (!isPaused && !gameStateRef.current.gameOver) {
        update(dt);
      }
      render(ctx);

      animationFrameId = requestAnimationFrame(loop);
    };

    // UPDATE PHYSICS & ENTITIES
    const update = (dt: number) => {
      const gs = gameStateRef.current;
      const now = Date.now();

      // Spawn next wave when all enemies destroyed
      if (gs.enemies.length === 0) {
        if (!gs.waveSpawned) {
          spawnCurrentWave();
        } else {
          // Current wave cleared!
          if (gs.currentWaveIndex < mission.waves.length - 1) {
            gs.currentWaveIndex++;
            gs.waveSpawned = false;
            audio.playPickup();
            spawnCurrentWave();
          } else {
            // ALL WAVES CLEARED -> MISSION VICTORY!
            gs.gameOver = true;
            audio.playVictory();
            const dur = Math.round((Date.now() - gs.startTime) / 1000);
            const acc = gs.shotsFiredCount > 0 ? Math.round((gs.shotsHitCount / gs.shotsFiredCount) * 100) : 80;
            onVictory({
              score: gs.scoreValue,
              enemiesKilled: gs.enemiesKilled,
              bossKilled: gs.bossKilled,
              powerUpsUsed: gs.powerUpsUsedCount,
              accuracy: acc,
              durationSec: dur,
            });
            return;
          }
        }
      }

      // Starfield scroll
      gs.stars.forEach((s) => {
        s.y += s.speed * (gs.activeBuffs["overdrive"] ? 2 : 1);
        if (s.y > canvas.height) {
          s.y = 0;
          s.x = Math.random() * canvas.width;
        }
      });

      // Player Movement
      const moveSpd = shipSpeed * (gs.activeBuffs["overdrive"] ? 1.4 : 1);
      let dx = 0;
      let dy = 0;

      if (gs.keys["arrowleft"] || gs.keys["a"]) dx -= 1;
      if (gs.keys["arrowright"] || gs.keys["d"]) dx += 1;
      if (gs.keys["arrowup"] || gs.keys["w"]) dy -= 1;
      if (gs.keys["arrowdown"] || gs.keys["s"]) dy += 1;

      // Touch drag interpolation
      if (gs.touch.active) {
        const diffX = gs.touch.x - gs.player.x;
        const diffY = gs.touch.y - gs.player.y;
        const dist = Math.hypot(diffX, diffY);
        if (dist > 5) {
          dx = diffX / dist;
          dy = diffY / dist;
        }
      }

      // Normalize diagonal
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      gs.player.x += dx * moveSpd * dt;
      gs.player.y += dy * moveSpd * dt;

      // Keep within bounds
      gs.player.x = Math.max(25, Math.min(canvas.width - 25, gs.player.x));
      gs.player.y = Math.max(50, Math.min(canvas.height - 40, gs.player.y));

      // Auto-fire or spacebar
      const fireMultiplier = gs.activeBuffs["rapid-fire"] ? 2.5 : 1;
      const currentFireInterval = 1000 / (baseFireRate * fireMultiplier);

      if (now - gs.lastShootTime > currentFireInterval) {
        gs.lastShootTime = now;
        audio.playLaser();
        gs.shotsFiredCount++;
        setShotsFired(gs.shotsFiredCount);

        const dmg = baseDamage * (gs.activeBuffs["overdrive"] ? 1.5 : 1);

        if (gs.activeBuffs["spread-shot"]) {
          // 5-way spread
          [-0.3, -0.15, 0, 0.15, 0.3].forEach((ang) => {
            gs.projectiles.push({
              x: gs.player.x,
              y: gs.player.y - 15,
              vx: Math.sin(ang) * 10,
              vy: -Math.cos(ang) * 10,
              damage: dmg * 0.8,
              isPlayer: true,
              color: "#38bdf8",
              size: 4,
            });
          });
        } else {
          // Standard twin lasers
          gs.projectiles.push(
            {
              x: gs.player.x - 12,
              y: gs.player.y - 12,
              vx: 0,
              vy: -12,
              damage: dmg,
              isPlayer: true,
              color: shipDef.color || "#38bdf8",
              size: 4,
            },
            {
              x: gs.player.x + 12,
              y: gs.player.y - 12,
              vx: 0,
              vy: -12,
              damage: dmg,
              isPlayer: true,
              color: shipDef.color || "#38bdf8",
              size: 4,
            }
          );
        }
      }

      // Update Projectiles
      for (let i = gs.projectiles.length - 1; i >= 0; i--) {
        const p = gs.projectiles[i];

        // Homing missile logic
        if (p.isHoming) {
          if (!p.target || p.target.health <= 0) {
            p.target = gs.enemies[0] || null;
          }
          if (p.target) {
            const hx = p.target.x - p.x;
            const hy = p.target.y - p.y;
            const hDist = Math.hypot(hx, hy);
            if (hDist > 0) {
              p.vx += (hx / hDist) * 0.6;
              p.vy += (hy / hDist) * 0.6;
            }
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Offscreen check
        if (p.y < -30 || p.y > canvas.height + 30 || p.x < -30 || p.x > canvas.width + 30) {
          gs.projectiles.splice(i, 1);
          continue;
        }

        // Projectile collisions
        if (p.isPlayer) {
          // Check collision with enemies
          for (let j = gs.enemies.length - 1; j >= 0; j--) {
            const e = gs.enemies[j];
            const dist = Math.hypot(p.x - e.x, p.y - e.y);
            if (dist < e.width / 2 + p.size) {
              e.health -= p.damage;
              gs.shotsHitCount++;
              setShotsHit(gs.shotsHitCount);
              gs.projectiles.splice(i, 1);

              // Hit spark particles
              for (let k = 0; k < 4; k++) {
                gs.particles.push({
                  x: p.x,
                  y: p.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  life: 15,
                  maxLife: 15,
                  color: "#f59e0b",
                  size: 2,
                });
              }

              // Enemy destroyed!
              if (e.health <= 0) {
                audio.playExplosion(e.type === "boss");
                gs.enemiesKilled++;
                gs.scoreValue += e.scoreValue;
                setScore(gs.scoreValue);

                // Big explosion particles
                const partCount = e.type === "boss" ? 60 : 18;
                for (let k = 0; k < partCount; k++) {
                  const ang = Math.random() * Math.PI * 2;
                  const sp = Math.random() * (e.type === "boss" ? 7 : 4);
                  gs.particles.push({
                    x: e.x,
                    y: e.y,
                    vx: Math.cos(ang) * sp,
                    vy: Math.sin(ang) * sp,
                    life: 30,
                    maxLife: 30,
                    color: e.color,
                    size: Math.random() * 4 + 2,
                  });
                }

                // Chance to drop combat pickup
                if (Math.random() < 0.35 || e.type === "boss") {
                  const pickRoll = Math.random();
                  let pType: Pickup["type"] = "credits";
                  let pLabel = "+50 CR";
                  let pCol = "#38bdf8";

                  if (pickRoll < 0.4) {
                    pType = "credits";
                    pLabel = "+50 CR";
                    pCol = "#38bdf8";
                  } else if (pickRoll < 0.65) {
                    pType = "shield";
                    pLabel = "SHIELD";
                    pCol = "#06b6d4";
                  } else if (pickRoll < 0.85) {
                    pType = "repair";
                    pLabel = "REPAIR";
                    pCol = "#10b981";
                  } else {
                    pType = "core";
                    pLabel = "+1 CORE";
                    pCol = "#a855f7";
                  }

                  gs.pickups.push({
                    x: e.x,
                    y: e.y,
                    type: pType,
                    label: pLabel,
                    color: pCol,
                    vy: 1.6,
                  });
                }

                if (e.type === "boss") {
                  gs.bossKilled = true;
                  setBossHealth(null);
                }

                gs.enemies.splice(j, 1);
              }
              break;
            }
          }
        } else {
          // Enemy projectile vs Player
          const pDist = Math.hypot(p.x - gs.player.x, p.y - gs.player.y);
          if (pDist < gs.player.width / 2 && now > gs.player.invulnerableUntil) {
            gs.projectiles.splice(i, 1);
            applyPlayerDamage(p.damage);
          }
        }
      }

      // Update Enemies
      for (let i = 0; i < gs.enemies.length; i++) {
        const e = gs.enemies[i];

        // Specific AI behaviors
        if (e.type === "scout") {
          e.y += e.speed;
          e.x += Math.sin(e.y * 0.04) * 2;
        } else if (e.type === "interceptor") {
          e.y += e.speed * 1.3;
          // Target player X slightly
          const dxToPlayer = gs.player.x - e.x;
          e.x += Math.sign(dxToPlayer) * 1.2;
        } else if (e.type === "armored_cruiser") {
          e.y += e.speed * 0.8;
          if (e.y > 180 && e.y < 350) {
            e.x += Math.sin(now * 0.002) * 1.5;
          }
        } else if (e.type === "gunship") {
          // Hovers around y: 120-180
          if (e.y < 130) e.y += e.speed;
          e.x += Math.cos(now * 0.003) * 2;
        } else if (e.type === "elite") {
          e.y += e.speed;
          e.x += Math.sin(now * 0.005) * 3;
        } else if (e.type === "boss") {
          // Boss flight patterns & phases
          e.x = canvas.width / 2 + Math.sin(now * 0.0018) * 180;
          setBossHealth({ current: Math.max(0, e.health), max: e.maxHealth, name: e.bossName || "Boss" });
        }

        // Enemy firing logic
        if (now - e.lastFireTime > e.fireInterval && e.y > 20 && e.y < canvas.height - 120) {
          e.lastFireTime = now;
          audio.playEnemyLaser();

          if (e.type === "armored_cruiser") {
            // Triple cannon
            [-16, 0, 16].forEach((ox) => {
              gs.projectiles.push({
                x: e.x + ox,
                y: e.y + 20,
                vx: ox * 0.05,
                vy: 5,
                damage: 15,
                isPlayer: false,
                color: "#eab308",
                size: 5,
              });
            });
          } else if (e.type === "boss") {
            // Boss attack patterns
            const phase = e.health < e.maxHealth * 0.5 ? 2 : 1;
            if (phase === 2) {
              // 7-way spread barrage
              for (let a = -3; a <= 3; a++) {
                gs.projectiles.push({
                  x: e.x,
                  y: e.y + 35,
                  vx: a * 1.8,
                  vy: 4.5,
                  damage: 18,
                  isPlayer: false,
                  color: "#f43f5e",
                  size: 6,
                });
              }
            } else {
              // Targeted twin beams
              const ang = Math.atan2(gs.player.y - e.y, gs.player.x - e.x);
              gs.projectiles.push({
                x: e.x,
                y: e.y + 30,
                vx: Math.cos(ang) * 5,
                vy: Math.sin(ang) * 5,
                damage: 22,
                isPlayer: false,
                color: "#a855f7",
                size: 7,
              });
            }
          } else {
            // Standard single projectile
            gs.projectiles.push({
              x: e.x,
              y: e.y + 15,
              vx: 0,
              vy: 5.5,
              damage: 12,
              isPlayer: false,
              color: "#f43f5e",
              size: 4,
            });
          }
        }

        // Body collision with player
        const dist = Math.hypot(e.x - gs.player.x, e.y - gs.player.y);
        if (dist < (e.width + gs.player.width) / 2 && now > gs.player.invulnerableUntil) {
          applyPlayerDamage(25);
          e.health -= 40;
        }

        // Loop enemies that flew off bottom
        if (e.y > canvas.height + 50 && e.type !== "boss") {
          e.y = -40;
          e.x = 40 + Math.random() * (canvas.width - 80);
        }
      }

      // Update Pickups
      for (let i = gs.pickups.length - 1; i >= 0; i--) {
        const pk = gs.pickups[i];
        pk.y += pk.vy;

        // Magnet attraction if Support Craft or close
        const dist = Math.hypot(pk.x - gs.player.x, pk.y - gs.player.y);
        const magnetDist = shipDef.id === "support" ? 180 : 80;
        if (dist < magnetDist) {
          pk.x += (gs.player.x - pk.x) * 0.12;
          pk.y += (gs.player.y - pk.y) * 0.12;
        }

        if (dist < gs.player.width / 2 + 15) {
          audio.playPickup();
          if (pk.type === "credits") {
            gs.scoreValue += 500;
            setScore(gs.scoreValue);
          } else if (pk.type === "shield") {
            gs.player.shield = Math.min(maxShield, gs.player.shield + 40);
            setShield(gs.player.shield);
          } else if (pk.type === "repair") {
            gs.player.health = Math.min(maxHealth, gs.player.health + 35);
            setHealth(gs.player.health);
          }
          gs.pickups.splice(i, 1);
          continue;
        }

        if (pk.y > canvas.height + 20) {
          gs.pickups.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = gs.particles.length - 1; i >= 0; i--) {
        const part = gs.particles[i];
        part.x += part.vx;
        part.y += part.vy;
        part.life--;
        if (part.life <= 0) {
          gs.particles.splice(i, 1);
        }
      }
    };

    // Apply Damage & Handle Defeat (Section 8 & 41)
    const applyPlayerDamage = (dmg: number) => {
      const gs = gameStateRef.current;
      if (gs.activeBuffs["shield-pulse"] || Date.now() < gs.player.invulnerableUntil) {
        return; // Complete shield pulse immunity
      }

      audio.playExplosion(false);
      gs.player.invulnerableUntil = Date.now() + 800; // brief i-frames

      // Damage shield first
      if (gs.player.shield > 0) {
        if (gs.player.shield >= dmg) {
          gs.player.shield -= dmg;
          dmg = 0;
        } else {
          dmg -= gs.player.shield;
          gs.player.shield = 0;
        }
        setShield(gs.player.shield);
      }

      if (dmg > 0) {
        gs.player.health = Math.max(0, gs.player.health - dmg);
        setHealth(gs.player.health);
      }

      // Check Defeat
      if (gs.player.health <= 0) {
        gs.gameOver = true;
        audio.playDefeat();
        onDefeat({
          score: gs.scoreValue,
          waveReached: gs.currentWaveIndex + 1,
          canRevive: true,
        });
      }
    };

    // RENDER FRAME
    const render = (c: CanvasRenderingContext2D) => {
      const gs = gameStateRef.current;
      c.clearRect(0, 0, canvas.width, canvas.height);

      // Deep space background
      const grad = c.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "#030712");
      grad.addColorStop(0.5, "#081329");
      grad.addColorStop(1, "#020617");
      c.fillStyle = grad;
      c.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Stars
      gs.stars.forEach((s) => {
        c.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        c.beginPath();
        c.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        c.fill();
      });

      // Draw Pickups
      gs.pickups.forEach((pk) => {
        c.save();
        c.shadowColor = pk.color;
        c.shadowBlur = 10;
        c.fillStyle = pk.color;
        c.beginPath();
        c.arc(pk.x, pk.y, 9, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#ffffff";
        c.font = "bold 9px Orbitron, sans-serif";
        c.textAlign = "center";
        c.fillText(pk.label, pk.x, pk.y + 18);
        c.restore();
      });

      // Draw Projectiles
      gs.projectiles.forEach((p) => {
        c.save();
        c.shadowColor = p.color;
        c.shadowBlur = p.isPlayer ? 10 : 6;
        c.fillStyle = p.color;
        c.beginPath();
        c.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        c.fill();
        c.restore();
      });

      // Draw Particles
      gs.particles.forEach((pt) => {
        const a = pt.life / pt.maxLife;
        c.fillStyle = pt.color;
        c.globalAlpha = a;
        c.beginPath();
        c.arc(pt.x, pt.y, pt.size * a, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1;
      });

      // Draw Enemies
      gs.enemies.forEach((e) => {
        c.save();
        c.translate(e.x, e.y);

        if (e.type === "boss") {
          // Boss flagship drawing
          c.shadowColor = e.color;
          c.shadowBlur = 20;
          c.fillStyle = "#1e1b4b";
          c.strokeStyle = e.color;
          c.lineWidth = 3;

          c.beginPath();
          c.moveTo(0, 40);
          c.lineTo(-45, -20);
          c.lineTo(-20, -35);
          c.lineTo(0, -25);
          c.lineTo(20, -35);
          c.lineTo(45, -20);
          c.closePath();
          c.fill();
          c.stroke();

          // Pulsing boss core
          c.fillStyle = e.color;
          c.beginPath();
          c.arc(0, 0, 14, 0, Math.PI * 2);
          c.fill();
        } else if (e.type === "armored_cruiser") {
          // Heavy cruiser
          c.fillStyle = "#1e293b";
          c.strokeStyle = e.color;
          c.lineWidth = 2;
          c.beginPath();
          c.moveTo(0, 22);
          c.lineTo(-22, -15);
          c.lineTo(-12, -22);
          c.lineTo(12, -22);
          c.lineTo(22, -15);
          c.closePath();
          c.fill();
          c.stroke();
        } else {
          // Agile scout/interceptor
          c.fillStyle = e.color;
          c.shadowColor = e.color;
          c.shadowBlur = 8;
          c.beginPath();
          c.moveTo(0, 16);
          c.lineTo(-15, -14);
          c.lineTo(0, -6);
          c.lineTo(15, -14);
          c.closePath();
          c.fill();
        }

        // Mini Enemy Health Bar (if damaged)
        if (e.health < e.maxHealth && e.type !== "boss") {
          const barW = 28;
          const hpPct = Math.max(0, e.health / e.maxHealth);
          c.fillStyle = "rgba(0,0,0,0.6)";
          c.fillRect(-barW / 2, -26, barW, 4);
          c.fillStyle = e.color;
          c.fillRect(-barW / 2, -26, barW * hpPct, 4);
        }

        c.restore();
      });

      // Draw Player Ship
      if (!gs.gameOver) {
        c.save();
        c.translate(gs.player.x, gs.player.y);

        // Invulnerability flicker
        if (Date.now() < gs.player.invulnerableUntil && Math.floor(Date.now() / 80) % 2 === 0) {
          c.globalAlpha = 0.3;
        }

        // Animated Thruster Glow
        const flameLength = 12 + Math.random() * 8;
        c.fillStyle = "#38bdf8";
        c.shadowColor = "#38bdf8";
        c.shadowBlur = 12;
        c.beginPath();
        c.moveTo(-7, 20);
        c.lineTo(0, 20 + flameLength);
        c.lineTo(7, 20);
        c.closePath();
        c.fill();

        // Ship Vector Hull
        c.shadowColor = shipDef.color || "#38bdf8";
        c.shadowBlur = 15;
        c.fillStyle = "#0f172a";
        c.strokeStyle = shipDef.color || "#38bdf8";
        c.lineWidth = 2.5;

        c.beginPath();
        c.moveTo(0, -24);
        c.lineTo(-18, 16);
        c.lineTo(-8, 12);
        c.lineTo(0, 18);
        c.lineTo(8, 12);
        c.lineTo(18, 16);
        c.closePath();
        c.fill();
        c.stroke();

        // Cockpit canopy
        c.fillStyle = "#e0f2fe";
        c.beginPath();
        c.ellipse(0, -4, 4, 8, 0, 0, Math.PI * 2);
        c.fill();

        // Active Shield Dome
        if (gs.activeBuffs["shield-pulse"] || gs.player.shield > 0) {
          c.strokeStyle = gs.activeBuffs["shield-pulse"] ? "rgba(56, 189, 248, 0.9)" : "rgba(56, 189, 248, 0.35)";
          c.lineWidth = 2.5;
          c.beginPath();
          c.arc(0, -2, 30, 0, Math.PI * 2);
          c.stroke();
        }

        c.restore();
      }
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      audio.stopBGM();
    };
  }, [
    mission,
    shipDef,
    shipSpeed,
    baseDamage,
    baseFireRate,
    maxHealth,
    maxShield,
    onVictory,
    onDefeat,
    isPaused,
    activatePowerUp,
  ]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 overflow-hidden select-none">
      {/* Top HUD Bar */}
      <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none px-3 py-2 bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 rounded-xl">
        {/* Player Health & Shield */}
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>SHIELD: {shield} / {maxShield}</span>
            </div>
            <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/30">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-sky-300 transition-all duration-200"
                style={{ width: `${Math.max(0, (shield / maxShield) * 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono text-rose-300">
              <Activity className="w-3.5 h-3.5 text-rose-400" />
              <span>HULL: {health} / {maxHealth}</span>
            </div>
            <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden border border-rose-500/30">
              <div
                className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-200"
                style={{ width: `${Math.max(0, (health / maxHealth) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Wave & Score */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-mono">SCORE</div>
            <div className="font-display font-bold text-base text-cyan-300">{score.toLocaleString()}</div>
          </div>

          <button
            onClick={() => setIsPaused((p) => !p)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Boss Health Bar Overlay */}
      {bossHealth && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-80 max-w-[90vw] p-2 bg-purple-950/80 backdrop-blur-md border border-purple-500/40 rounded-xl text-center animate-pulse">
          <div className="flex items-center justify-between text-xs font-mono text-purple-200 mb-1">
            <span className="font-bold uppercase tracking-wider">{bossHealth.name}</span>
            <span>{Math.round((bossHealth.current / bossHealth.max) * 100)}%</span>
          </div>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-purple-500/40">
            <div
              className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-400 transition-all duration-150"
              style={{ width: `${(bossHealth.current / bossHealth.max) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Wave announcement banner */}
      {waveAnnouncement && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none text-center animate-bounce">
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-purple-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]">
            {waveAnnouncement}
          </h2>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={540}
        height={760}
        className="w-full max-w-[540px] max-h-[82vh] rounded-2xl border border-cyan-500/30 shadow-[0_0_30px_rgba(56,189,248,0.15)] bg-slate-950 cursor-crosshair"
      />

      {/* Bottom Power-Ups Bar (Keys 1-8 / Mobile Tap) */}
      <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center justify-center gap-1.5 p-2 bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 rounded-xl overflow-x-auto">
        {[
          { id: "shield-pulse", name: "Shield", icon: Shield, key: "1" },
          { id: "rapid-fire", name: "Rapid", icon: Zap, key: "2" },
          { id: "spread-shot", name: "Spread", icon: Flame, key: "3" },
          { id: "homing-missiles", name: "Missiles", icon: Crosshair, key: "4" },
          { id: "emp-blast", name: "EMP", icon: Radio, key: "5" },
          { id: "repair-drone", name: "Repair", icon: Wrench, key: "6" },
          { id: "overdrive", name: "Overdrive", icon: Activity, key: "7" },
          { id: "emergency-warp", name: "Warp", icon: Sparkles, key: "8" },
        ].map((pw) => {
          const count = localInventory[pw.id] || 0;
          const isCd = cooldowns[pw.id] && cooldowns[pw.id] > Date.now();
          const Icon = pw.icon;

          return (
            <button
              key={pw.id}
              onClick={() => activatePowerUp(pw.id)}
              disabled={count <= 0 || Boolean(isCd)}
              className={`relative flex flex-col items-center justify-center w-12 h-14 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                count > 0 && !isCd
                  ? "bg-cyan-950/60 border-cyan-400 text-cyan-200 hover:bg-cyan-900 hover:scale-105"
                  : "bg-slate-900/60 border-slate-700 text-slate-500 opacity-60"
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] leading-tight truncate">{pw.name}</span>
              <span className="absolute -top-1.5 -right-1 px-1 rounded-full text-[9px] font-bold bg-cyan-500 text-slate-950">
                {count}
              </span>
              <span className="absolute bottom-0 text-[8px] text-slate-400 opacity-50">
                [{pw.key}]
              </span>
            </button>
          );
        })}
      </div>

      {/* Pause Menu Modal (Section 21) */}
      {isPaused && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-cyan-500/40 bg-slate-900 p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold font-display text-cyan-300">TACTICAL PAUSE</h3>
            <p className="text-xs text-slate-400">Sortie paused. Systems in holding orbit.</p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setIsPaused(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-bold hover:brightness-110 font-display transition-all cursor-pointer"
              >
                Resume Combat
              </button>
              <button
                onClick={onExit}
                className="w-full py-2.5 rounded-xl border border-slate-700 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold transition-all cursor-pointer"
              >
                Abort & Return to Hangar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
