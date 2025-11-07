import React, { useState, useCallback } from 'react';
import GameScreen from './components/GameScreen';
import MainMenu from './components/MainMenu';
import GameOverScreen from './components/GameOverScreen';
import { GameState, ShipType } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MainMenu);
  const [selectedShip, setSelectedShip] = useState<ShipType>(ShipType.Pegasus);
  const [finalScore, setFinalScore] = useState(0);

  const startGame = useCallback((ship: ShipType) => {
    setSelectedShip(ship);
    setGameState(GameState.Playing);
    setFinalScore(0);
  }, []);

  const endGame = useCallback((score: number) => {
    setFinalScore(score);
    setGameState(GameState.GameOver);
  }, []);

  const restartGame = useCallback(() => {
    setGameState(GameState.MainMenu);
  }, []);

  const renderGameState = () => {
    switch (gameState) {
      case GameState.Playing:
        return <GameScreen shipType={selectedShip} onGameOver={endGame} />;
      case GameState.GameOver:
        return <GameOverScreen score={finalScore} onRestart={restartGame} />;
      case GameState.MainMenu:
      default:
        return <MainMenu onStartGame={startGame} />;
    }
  };

  return (
    <div className="bg-black w-screen h-screen flex items-center justify-center overflow-hidden">
      <div className="w-full h-full max-w-[600px] max-h-[1000px] relative">
        {renderGameState()}
      </div>
    </div>
  );
};

export default App;
