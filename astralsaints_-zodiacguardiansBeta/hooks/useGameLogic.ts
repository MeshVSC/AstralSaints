import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ShipType, PlayerState, EnemyState, ProjectileState, ParticleState, GameLogicState,
  FormLevel, EnemyType, Vector2D, GameObject, PowerUpType, PowerUpState, ShipWeaponType, EnemySpawnConfig
} from '../types';
import {
  GAME_WIDTH, GAME_HEIGHT, PLAYER_START_POS, PLAYER_SIZE, PLAYER_SPEED, PLAYER_HEALTH,
  PLAYER_BASE_FIRE_RATE, PLAYER_FIRE_RATE_BONUS_PER_LEVEL, PLAYER_MAX_FIRE_RATE_LEVEL,
  PLAYER_BASE_DAMAGE, PLAYER_DAMAGE_PER_LEVEL, PLAYER_MAX_POWER_LEVEL,
  PROJECTILE_SIZE, PLAYER_PROJECTILE_SPEED, ENEMY_PROJECTILE_SPEED,
  ENEMY_STATS, COMBO_TIMEOUT, EVOLUTION_THRESHOLDS, AWAKENING_COMBO_TRIGGER, AWAKENING_DURATION,
  BOSS_SPAWN_SCORE, BOSS_HEALTH_INCREASE_FACTOR, BOSS_HORIZONTAL_SPEED,
  POWERUP_SIZE, POWERUP_SPEED, POWERUP_DROP_CHANCE,
  SHIP_DATA, WAVE_DEFINITIONS, WAVE_CLEAR_COOLDOWN, SPECIAL_WEAPON_COOLDOWN
} from '../constants';

interface GameLogicProps {
  shipType: ShipType;
  onGameOver: (score: number) => void;
}

const useGameLogic = ({ shipType, onGameOver }: GameLogicProps) => {
  const [state, setState] = useState<GameLogicState>(() => ({
    player: {
      id: 'player',
      position: { ...PLAYER_START_POS },
      size: { ...PLAYER_SIZE },
      health: PLAYER_HEALTH,
      maxHealth: PLAYER_HEALTH,
      form: FormLevel.I,
      isAwakened: false,
      awakeningEndTime: 0,
      lastFired: 0,
      powerLevel: 1,
      fireRateLevel: 1,
      lastEvolutionTime: 0,
      specialWeaponReady: true,
      specialWeaponCooldown: 0,
    },
    enemies: [],
    projectiles: [],
    particles: [],
    powerUps: [],
    keys: {},
    score: 0,
    combo: 0,
    comboTimer: 0,
    gameTime: 0,
    bossActive: false,
    nextBossScore: BOSS_SPAWN_SCORE,
    currentWaveIndex: -1,
    waveClearTimer: WAVE_CLEAR_COOLDOWN,
    powerUpDroppedThisWave: false,
    isSpawning: false,
  }));
  
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;
  
  const createParticles = useCallback((position: Vector2D, count: number, color: string, speed: number, size: number) => {
    const newParticles: ParticleState[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: `p-${Date.now()}-${Math.random()}`,
        position: { ...position },
        size: { width: size, height: size },
        velocity: {
          x: (Math.random() - 0.5) * speed,
          y: (Math.random() - 0.5) * speed
        },
        lifetime: 500 + Math.random() * 500,
        maxLifetime: 1000,
        color: color,
      });
    }
    setState(prevState => ({ ...prevState, particles: [...prevState.particles, ...newParticles] }));
  }, []);

  const gameLoop = useCallback((time: number) => {
    console.log("game loop running");
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = time;
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    setState(prevState => {
      let newState = { ...prevState };
      newState.gameTime += deltaTime;
      
      const { player, keys } = newState;
      if (keys['w'] || keys['ArrowUp']) player.position.y -= PLAYER_SPEED;
      if (keys['s'] || keys['ArrowDown']) player.position.y += PLAYER_SPEED;
      if (keys['a'] || keys['ArrowLeft']) player.position.x -= PLAYER_SPEED;
      if (keys['d'] || keys['ArrowRight']) player.position.x += PLAYER_SPEED;
      player.position.x = Math.max(0, Math.min(GAME_WIDTH - player.size.width, player.position.x));
      player.position.y = Math.max(0, Math.min(GAME_HEIGHT - player.size.height, player.position.y));

      if (player.isAwakened && time > player.awakeningEndTime) {
        player.isAwakened = false;
        newState.combo = 0;
      }
      
      if ((keys['k'] || keys['x']) && !player.isAwakened && newState.combo >= AWAKENING_COMBO_TRIGGER) {
        player.isAwakened = true;
        player.awakeningEndTime = time + AWAKENING_DURATION;
      }
      
      // Update Special Weapon Cooldown
      if (player.specialWeaponCooldown > 0) {
          player.specialWeaponCooldown -= deltaTime;
          if (player.specialWeaponCooldown <= 0) {
              player.specialWeaponCooldown = 0;
              player.specialWeaponReady = true;
          }
      }

      // Player Firing
      const fireRateBonus = (player.fireRateLevel - 1) * PLAYER_FIRE_RATE_BONUS_PER_LEVEL;
      const currentFireRate = player.isAwakened ? (PLAYER_BASE_FIRE_RATE - fireRateBonus) / 3 : PLAYER_BASE_FIRE_RATE - fireRateBonus;
      if (time - player.lastFired > currentFireRate) {
        player.lastFired = time;
        const newProjectiles: ProjectileState[] = [];
        const damageBonus = (player.powerLevel - 1) * PLAYER_DAMAGE_PER_LEVEL;
        const currentDamage = player.isAwakened ? (PLAYER_BASE_DAMAGE + damageBonus) * 2 : PLAYER_BASE_DAMAGE + damageBonus;
        const weaponType = SHIP_DATA[shipType].weaponType;

        const createProjectile = (offset: Vector2D, angle: number, size: {w:number, h:number}) => ({
          id: `proj-${time}-${Math.random()}`,
          owner: 'player' as const,
          position: { x: player.position.x + player.size.width / 2 + offset.x, y: player.position.y + offset.y },
          size: { width: size.w, height: size.h },
          damage: currentDamage,
          velocity: { x: Math.sin(angle) * PLAYER_PROJECTILE_SPEED, y: -Math.cos(angle) * PLAYER_PROJECTILE_SPEED },
          weaponType,
        });
        
        const form = player.isAwakened ? Math.max(player.form, FormLevel.II) : player.form;

        switch(weaponType) {
            case ShipWeaponType.Spread:
                newProjectiles.push(createProjectile({x:0, y:0}, 0, {w: 6, h:18}));
                if (form >= FormLevel.II) {
                    newProjectiles.push(createProjectile({x:-15, y:5}, -0.15, {w: 6, h:18}));
                    newProjectiles.push(createProjectile({x:15, y:5}, 0.15, {w: 6, h:18}));
                }
                if (form >= FormLevel.III) {
                    newProjectiles.push(createProjectile({x:-30, y:10}, -0.25, {w: 6, h:18}));
                    newProjectiles.push(createProjectile({x:30, y:10}, 0.25, {w: 6, h:18}));
                }
                break;
            case ShipWeaponType.TriBeam:
                const beamOffset = 15;
                newProjectiles.push(createProjectile({x:0, y:0}, 0, {w:4, h:32}));
                if (form >= FormLevel.II) {
                    newProjectiles.push(createProjectile({x: -beamOffset, y:0}, 0, {w:4, h:32}));
                    newProjectiles.push(createProjectile({x: beamOffset, y:0}, 0, {w:4, h:32}));
                }
                if (form >= FormLevel.III) {
                    newProjectiles.push(createProjectile({x: -beamOffset*2, y:0}, 0, {w:4, h:32}));
                    newProjectiles.push(createProjectile({x: beamOffset*2, y:0}, 0, {w:4, h:32}));
                }
                break;
            case ShipWeaponType.Pulse:
                 newProjectiles.push(createProjectile({x:0, y:0}, 0, {w:12, h:12}));
                 if(form >= FormLevel.II) newProjectiles.push(createProjectile({x:-25, y:10}, 0, {w:12, h:12}));
                 if(form >= FormLevel.III) newProjectiles.push(createProjectile({x:25, y:10}, 0, {w:12, h:12}));
                 break;
            case ShipWeaponType.Wave:
                 newProjectiles.push(createProjectile({x:0, y:0}, 0, {w:32, h:8}));
                 if(form >= FormLevel.II) newProjectiles.push(createProjectile({x:0, y:0}, 0, {w:48, h:8}));
                 if(form >= FormLevel.III) newProjectiles.push(createProjectile({x:0, y:0}, 0, {w:64, h:8}));
                 break;
            case ShipWeaponType.Charge: // Simplified for now
                newProjectiles.push(createProjectile({x:0, y:0}, 0, {w:16, h:16}));
                break;
        }
        newState.projectiles = [...newState.projectiles, ...newProjectiles];
      }

      if ((keys['j'] || keys['z']) && player.specialWeaponReady) {
        player.specialWeaponReady = false;
        player.specialWeaponCooldown = SPECIAL_WEAPON_COOLDOWN;
        createParticles({x: player.position.x + player.size.width/2, y: player.position.y + player.size.height/2}, 50, '#00ffff', 15, 8);
        newState.enemies.forEach(e => e.health -= 300);
      }

      newState.projectiles = newState.projectiles.map(p => ({
        ...p,
        position: { x: p.position.x + p.velocity.x, y: p.position.y + p.velocity.y }
      })).filter(p => p.position.y > -p.size.height && p.position.y < GAME_HEIGHT);

      // --- NEW WAVE-BASED ENEMY SPAWNING ---
      if (!newState.bossActive) {
          if (newState.enemies.length === 0 && !newState.isSpawning) {
              newState.waveClearTimer -= deltaTime;
              if (newState.waveClearTimer <= 0) {
                  newState.currentWaveIndex = (newState.currentWaveIndex + 1) % WAVE_DEFINITIONS.length;
                  const wave = WAVE_DEFINITIONS[newState.currentWaveIndex];
                  wave.enemies.forEach(spawnConfig => {
                      const stats = ENEMY_STATS[spawnConfig.type];
                      newState.enemies.push({
                          id: `enemy-${time}-${Math.random()}`,
                          type: spawnConfig.type,
                          position: { x: spawnConfig.x * (GAME_WIDTH - stats.size.width), y: -stats.size.height },
                          size: stats.size,
                          health: stats.health,
                          maxHealth: stats.health,
                          points: stats.points,
                          lastFired: 0,
                          spawnTime: time + spawnConfig.delay,
                      });
                  });
                  newState.isSpawning = true;
                  newState.powerUpDroppedThisWave = false;
              }
          }
      }
      
      const activeEnemies = newState.enemies.filter(e => e.spawnTime && time >= e.spawnTime);
      if(newState.isSpawning && activeEnemies.length === newState.enemies.length) {
          newState.isSpawning = false;
          newState.waveClearTimer = WAVE_CLEAR_COOLDOWN;
      }
      
      if (!newState.bossActive && newState.score >= newState.nextBossScore) {
        newState.bossActive = true;
        newState.enemies = []; // Clear other enemies
        const stats = ENEMY_STATS[EnemyType.Boss];
        const bossHealth = stats.health * Math.pow(BOSS_HEALTH_INCREASE_FACTOR, (newState.nextBossScore / BOSS_SPAWN_SCORE) - 1);
        newState.enemies.push({
            id: `boss-${time}`, type: EnemyType.Boss,
            position: { x: GAME_WIDTH / 2 - stats.size.width / 2, y: -stats.size.height },
            size: stats.size, health: bossHealth, maxHealth: bossHealth, points: stats.points, lastFired: 0,
            vx: BOSS_HORIZONTAL_SPEED, spawnTime: time,
        });
      }

      newState.enemies = newState.enemies.map(e => {
        if (!e.spawnTime || time < e.spawnTime) return e; // Don't update if not spawned yet

        if (e.type === EnemyType.Boss) {
            if (e.position.y < 50) e.position.y += ENEMY_STATS[e.type].speed / 2;
            else {
              e.position.x += e.vx!;
              if (e.position.x <= 0 || e.position.x >= GAME_WIDTH - e.size.width) e.vx = -(e.vx!);
            }
            if (ENEMY_STATS[e.type].fireRate && time - (e.lastFired || 0) > ENEMY_STATS[e.type].fireRate!) {
                e.lastFired = time;
                for(let i = -2; i <= 2; i++) {
                     newState.projectiles.push({
                        id: `eproj-${time}-${Math.random()}-${i}`, owner: 'enemy',
                        position: {x: e.position.x + e.size.width / 2 - 5, y: e.position.y + e.size.height},
                        size: {width: 10, height: 10}, damage: 15,
                        velocity: { x: i * 1.5, y: ENEMY_PROJECTILE_SPEED }
                    });
                }
            }
        } else {
            e.position.y += ENEMY_STATS[e.type].speed;
            if (e.type === EnemyType.Striker && ENEMY_STATS[e.type].fireRate && time - (e.lastFired || 0) > ENEMY_STATS[e.type].fireRate!) {
                e.lastFired = time;
                newState.projectiles.push({
                    id: `eproj-${time}-${Math.random()}`, owner: 'enemy',
                    position: {x: e.position.x + e.size.width / 2 - 5, y: e.position.y + e.size.height},
                    size: {width: 10, height: 10}, damage: 10,
                    velocity: { x: 0, y: ENEMY_PROJECTILE_SPEED }
                });
            }
        }
        return e;
      }).filter(e => e.position.y < GAME_HEIGHT);
      
      newState.particles = newState.particles.map(p => ({
        ...p,
        position: { x: p.position.x + p.velocity.x, y: p.position.y + p.velocity.y },
        lifetime: p.lifetime - deltaTime,
      })).filter(p => p.lifetime > 0);
        
      newState.powerUps = newState.powerUps.map(p => ({
          ...p,
          position: { ...p.position, y: p.position.y + POWERUP_SPEED }
      })).filter(p => p.position.y < GAME_HEIGHT);

      if (newState.comboTimer > 0) {
        newState.comboTimer -= deltaTime;
        if (newState.comboTimer <= 0) newState.combo = 0;
      }
      
      const checkCollision = (o1: GameObject, o2: GameObject) => (
          o1.position.x < o2.position.x + o2.size.width &&
          o1.position.x + o1.size.width > o2.position.x &&
          o1.position.y < o2.position.y + o2.size.height &&
          o1.position.y + o1.size.height > o2.position.y
      );

      const projectilesToRemove = new Set<string>();
      const enemiesToRemove = new Set<string>();
      const powerupsToRemove = new Set<string>();

      for (const p of newState.projectiles) {
        if (p.owner !== 'player' || projectilesToRemove.has(p.id)) continue;
        for (const e of newState.enemies) {
          if (!e.spawnTime || time < e.spawnTime || enemiesToRemove.has(e.id)) continue;

          if (checkCollision(p, e)) {
            e.health -= p.damage;
            createParticles({x: p.position.x, y: p.position.y}, 5, '#00ffff', 5, 3);
            if (p.weaponType !== ShipWeaponType.Wave) projectilesToRemove.add(p.id);

            if (e.health <= 0) {
              enemiesToRemove.add(e.id);
              newState.score += e.points * (newState.combo || 1);
              newState.combo = Math.min(AWAKENING_COMBO_TRIGGER, (newState.combo || 0) + 1);
              newState.comboTimer = COMBO_TIMEOUT;
              createParticles({x: e.position.x + e.size.width/2, y: e.position.y + e.size.height/2}, 30, '#ff8c00', 8, 5);
              
              if ((!newState.powerUpDroppedThisWave && Math.random() < POWERUP_DROP_CHANCE) || e.type === EnemyType.Boss) {
                  newState.powerUpDroppedThisWave = true;
                  newState.powerUps.push({
                      id: `powerup-${time}-${Math.random()}`,
                      type: Math.random() < 0.5 ? PowerUpType.Power : PowerUpType.Rate,
                      position: { x: e.position.x + e.size.width / 2 - POWERUP_SIZE.width / 2, y: e.position.y + e.size.height / 2 - POWERUP_SIZE.height / 2 },
                      size: POWERUP_SIZE,
                  });
              }
              if (e.type === EnemyType.Boss) {
                  newState.bossActive = false;
                  newState.nextBossScore += BOSS_SPAWN_SCORE;
                  newState.waveClearTimer = WAVE_CLEAR_COOLDOWN;
              }
            }
            if (p.weaponType !== ShipWeaponType.Wave) break; 
          }
        }
      }
      
       for (const p of newState.projectiles) {
        if (p.owner !== 'enemy' || projectilesToRemove.has(p.id)) continue;
        if (checkCollision(p, player) && !player.isAwakened) {
            player.health -= p.damage;
            projectilesToRemove.add(p.id);
            createParticles(player.position, 20, '#ff4500', 10, 4);
            if (player.health <= 0) {
              onGameOverRef.current(newState.score);
              if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
              return prevState;
            }
        }
      }
      
      for (const e of newState.enemies) {
          if(!e.spawnTime || time < e.spawnTime || enemiesToRemove.has(e.id)) continue;
          if(checkCollision(player, e)){
              if(!player.isAwakened) player.health -= 25;
              e.health -= e.type === EnemyType.Boss ? 50 : 100;
              
              if (e.health <= 0) enemiesToRemove.add(e.id);
              
              createParticles(player.position, 20, '#ff4500', 10, 4);
              if(player.health <= 0) {
                onGameOverRef.current(newState.score);
                if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
                return prevState;
              }
          }
      }

      for(const p of newState.powerUps) {
        if(powerupsToRemove.has(p.id)) continue;
        if(checkCollision(player, p)) {
            if (p.type === PowerUpType.Power) player.powerLevel = Math.min(PLAYER_MAX_POWER_LEVEL, player.powerLevel + 1);
            else player.fireRateLevel = Math.min(PLAYER_MAX_FIRE_RATE_LEVEL, player.fireRateLevel + 1);
            powerupsToRemove.add(p.id);
            createParticles(p.position, 20, p.type === PowerUpType.Power ? '#ef4444' : '#3b82f6', 6, 4);
        }
      }

      newState.projectiles = newState.projectiles.filter(p => !projectilesToRemove.has(p.id));
      newState.enemies = newState.enemies.filter(e => !enemiesToRemove.has(e.id));
      newState.powerUps = newState.powerUps.filter(p => !powerupsToRemove.has(p.id));
      
      if(player.form < FormLevel.III && newState.score >= EVOLUTION_THRESHOLDS[player.form + 1]) {
          player.form++;
          player.lastEvolutionTime = time;
          player.health = Math.min(player.maxHealth, player.health + 50);
          createParticles({x:player.position.x + player.size.width/2, y: player.position.y + player.size.height/2}, 80, 'gold', 15, 8);
      }
      return newState;
    });
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [createParticles, shipType]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.startsWith('Arrow') ? e.key : e.key.toLowerCase();
      setState(s => ({ ...s, keys: { ...s.keys, [key]: true } }));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.startsWith('Arrow') ? e.key : e.key.toLowerCase();
      setState(s => ({ ...s, keys: { ...s.keys, [key]: false } }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  return state;
};

export default useGameLogic;