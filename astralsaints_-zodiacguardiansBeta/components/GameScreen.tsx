import React, { useState, useEffect } from 'react';
import useGameLogic from '../hooks/useGameLogic';
import { ShipType, FormLevel, EnemyType, PowerUpType, ShipWeaponType } from '../types';
import { 
  PegasusIcon, DragonIcon, CygnusIcon, AndromedaIcon, PhoenixIcon,
  EnemyScoutIcon, EnemyStrikerIcon, EnemyBruiserIcon, BossAriesIcon,
  PlayerProjectileIcon, EnemyProjectileIcon, PowerUpIcon, SpecialWeaponIcon
} from './icons';
import { SHIP_DATA, SPECIAL_WEAPON_COOLDOWN } from '../constants';

interface GameScreenProps {
  shipType: ShipType;
  onGameOver: (score: number) => void;
}

const shipComponents: Record<ShipType, React.FC<any>> = {
  [ShipType.Pegasus]: PegasusIcon,
  [ShipType.Dragon]: DragonIcon,
  [ShipType.Cygnus]: CygnusIcon,
  [ShipType.Andromeda]: AndromedaIcon,
  [ShipType.Phoenix]: PhoenixIcon,
};

const GameScreen: React.FC<GameScreenProps> = ({ shipType, onGameOver }) => {
  const {
    player, enemies, projectiles, particles, powerUps, score, combo, bossActive
  } = useGameLogic({ shipType, onGameOver });

  const [showEvolutionFlash, setShowEvolutionFlash] = useState(false);
  const [lastEvolutionTime, setLastEvolutionTime] = useState(player.lastEvolutionTime);

  useEffect(() => {
      if (player.lastEvolutionTime > lastEvolutionTime) {
          setShowEvolutionFlash(true);
          setLastEvolutionTime(player.lastEvolutionTime);
          const timer = setTimeout(() => setShowEvolutionFlash(false), 500);
          return () => clearTimeout(timer);
      }
  }, [player.lastEvolutionTime, lastEvolutionTime]);

  const PlayerShip = shipComponents[shipType];
  const shipData = SHIP_DATA[shipType];

  const hueRotation = shipData.hue;
  const baseFilter = player.isAwakened ? 'drop-shadow(0 0 15px #fde047)' : 'drop-shadow(0 0 8px #67e8f9)';
  const shipFilter = hueRotation !== 0 ? `${baseFilter} hue-rotate(${hueRotation}deg)` : baseFilter;

  return (
    <div className="w-full h-full bg-gray-900 overflow-hidden relative" style={{ perspective: '800px', background: 'radial-gradient(ellipse at 50% 20%, #0c1445, #000)' }}>
      {/* Background Stars */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-scroll-bg"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 animate-scroll-bg-reverse"></div>

      {/* Game Objects */}
      <div className="absolute inset-0">
        {/* Particles */}
        {particles.map(p => (
          <div key={p.id} className="absolute rounded-full" style={{
            left: p.position.x,
            top: p.position.y,
            width: p.size.width,
            height: p.size.height,
            backgroundColor: p.color,
            opacity: p.lifetime / p.maxLifetime,
            transform: `scale(${p.lifetime / p.maxLifetime})`
          }} />
        ))}

        {/* Power-ups */}
        {powerUps.map(p => (
          <div key={p.id} className="absolute" style={{ left: p.position.x, top: p.position.y, width: p.size.width, height: p.size.height }}>
            <PowerUpIcon type={p.type} className="w-full h-full" />
          </div>
        ))}
        
        {/* Player */}
        <PlayerShip
          form={player.form}
          isAwakened={player.isAwakened}
          className={`absolute w-12 h-12 transition-transform duration-500 ${player.isAwakened ? 'animate-pulse' : ''} ${showEvolutionFlash ? 'animate-evolve-flash' : ''}`}
          style={{ 
            left: player.position.x, 
            top: player.position.y,
            width: player.size.width,
            height: player.size.height,
            filter: shipFilter,
          }}
        />

        {/* Enemies */}
        {enemies.map(enemy => {
          let EnemyIcon;
          switch (enemy.type) {
            case EnemyType.Boss: EnemyIcon = BossAriesIcon; break;
            case EnemyType.Bruiser: EnemyIcon = EnemyBruiserIcon; break;
            case EnemyType.Striker: EnemyIcon = EnemyStrikerIcon; break;
            default: EnemyIcon = EnemyScoutIcon;
          }
          return (
            <div key={enemy.id} className="absolute" style={{ left: enemy.position.x, top: enemy.position.y, width: enemy.size.width, height: enemy.size.height }}>
              <EnemyIcon className="w-full h-full" />
              {enemy.health < enemy.maxHealth && (
                <div className="absolute -bottom-2 left-0 w-full h-1.5 bg-red-800 rounded">
                  <div className="h-full bg-red-400 rounded" style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}></div>
                </div>
              )}
            </div>
          );
        })}

        {/* Projectiles */}
        {projectiles.map(p => (
          <div key={p.id} className="absolute" style={{ left: p.position.x, top: p.position.y, width: p.size.width, height: p.size.height, transform: 'translate(-50%, -50%)' }}>
            {p.owner === 'player' 
              ? <PlayerProjectileIcon weaponType={p.weaponType} isAwakened={player.isAwakened} className="w-full h-full" /> 
              : <EnemyProjectileIcon className="w-full h-full" />
            }
          </div>
        ))}
      </div>
      
      {/* Evolution Screen Flash */}
      {showEvolutionFlash && <div className="absolute inset-0 bg-white animate-screen-flash pointer-events-none"></div>}

      {/* HUD */}
      <div className="absolute inset-0 p-4 text-white font-orbitron flex justify-between items-start pointer-events-none">
        {/* Left Panel */}
        <div className="flex flex-col space-y-2 items-start">
          <div className="hud-panel text-left">
            <p className="text-2xl font-bold text-cyan-300 text-glow">{score.toLocaleString()}</p>
            <p className="text-sm text-gray-300 tracking-widest">SCORE</p>
          </div>
          <div className="hud-panel text-left">
            <p className="text-lg font-bold text-red-400">POWER: {player.powerLevel}</p>
            <p className="text-lg font-bold text-blue-400">RATE: {player.fireRateLevel}</p>
          </div>
        </div>

        {/* Center Panel */}
        <div className="flex flex-col items-center">
            {combo > 1 && (
                 <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-500 animate-[pulse_0.5s_ease-out] drop-shadow-[0_0_10px_#f59e0b]">
                    x{combo}
                 </p>
            )}
        </div>

        {/* Right Panel */}
        <div className="flex flex-col space-y-2 items-end">
          <div className="hud-panel text-right">
            <p className="text-2xl font-bold text-green-400 text-glow">{player.health}</p>
            <p className="text-sm text-gray-300 tracking-widest">ARMOR</p>
          </div>
           <div className="hud-panel text-right">
            <p className="text-lg font-bold text-yellow-400">FORM: {'I'.repeat(player.form)}</p>
          </div>
        </div>
      </div>
      
       {/* Special Weapon HUD */}
      <div className="absolute bottom-4 right-4 pointer-events-none">
          <div className="hud-special-weapon flex items-center justify-center">
              <div className="hud-special-weapon-cooldown" style={{ height: `${(1 - player.specialWeaponCooldown / SPECIAL_WEAPON_COOLDOWN) * 100}%` }}></div>
              <SpecialWeaponIcon className="w-10 h-10 z-10" isReady={player.specialWeaponReady} />
          </div>
      </div>
      
      {bossActive && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3/4 pointer-events-none">
            <p className="text-center text-2xl font-cinzel text-red-500 animate-pulse">BOSS INCOMING</p>
          </div>
      )}
    </div>
  );
};

export default GameScreen;