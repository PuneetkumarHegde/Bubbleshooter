import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import { createGameConfig } from '../game/gameEngine';
import { getLevelById } from '../data/levels/levels';
import { useGameStore, GAME_STATUS } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { gameService } from '../services/gameService';
import { ScoreManager } from '../game/scoreManager';
import GameHUD from '../components/GameHUD/GameHUD';
import LevelCompleteModal from '../components/Modals/LevelCompleteModal';
import LevelFailedModal from '../components/Modals/LevelFailedModal';
import PauseModal from '../components/Modals/PauseModal';
import soundManager from '../game/audioEngine';

export default function GamePage() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const phaserGameRef = useRef(null);
  const containerRef = useRef(null);

  const [isPaused, setIsPaused] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());

  const {
    level,
    gameStatus,
    setLevel,
    setGameStatus,
    setSessionData,
    sessionData,
    score,
    shotsRemaining,
    bestCombo,
    bubblesPoppedTotal,
    activateBooster,
  } = useGameStore();

  const { isAuthenticated, updateLocalProgress } = useAuthStore();

  // Initialize level and session
  useEffect(() => {
    const targetLevelId = levelId || '1';
    const loadedLevel = getLevelById(targetLevelId);
    setLevel(loadedLevel);
    setSessionStartTime(Date.now());

    // Start server game session if authenticated
    if (isAuthenticated) {
      gameService.startGameSession(targetLevelId)
        .then((res) => {
          if (res && res.session) {
            setSessionData(res.session);
          }
        })
        .catch((err) => {
          console.warn('Game session start offline or unauthenticated fallback:', err.message);
        });
    }

    soundManager.startBGM();

    return () => {
      // Cleanup
    };
  }, [levelId, isAuthenticated]);

  // Mount Phaser game instance once
  useEffect(() => {
    if (!phaserGameRef.current && containerRef.current) {
      const config = createGameConfig(containerRef.current);
      phaserGameRef.current = new Phaser.Game(config);
    }

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  // Handle Level Complete backend submission and local progress sync
  useEffect(() => {
    if (gameStatus === GAME_STATUS.LEVEL_COMPLETE && level) {
      const shotsUsed = Math.max(0, level.shots - shotsRemaining);
      const starsEarned = ScoreManager.calculateStars(score, level.starThresholds);
      const durationSeconds = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));

      // Update local store immediately for instant UI responsiveness
      updateLocalProgress(level.id, starsEarned, score, bubblesPoppedTotal, bestCombo);

      // Submit to server if authenticated and session is active
      if (isAuthenticated && sessionData?.sessionToken) {
        gameService.completeGameSession({
          sessionToken: sessionData.sessionToken,
          levelId: level.id,
          score,
          stars: starsEarned,
          shotsUsed,
          durationSeconds,
          bubblesPopped: bubblesPoppedTotal,
          bestCombo,
        }).catch((e) => {
          console.warn('Score submission queued or network offline:', e.message);
        });
      }
    }
  }, [gameStatus]);

  const handlePause = () => {
    setIsPaused(true);
    setGameStatus(GAME_STATUS.PAUSED);
    if (phaserGameRef.current?.scene?.scenes[0]?.scene) {
      phaserGameRef.current.scene.scenes[0].scene.pause();
    }
    soundManager.playClick();
  };

  const handleResume = () => {
    setIsPaused(false);
    setGameStatus(GAME_STATUS.READY);
    if (phaserGameRef.current?.scene?.scenes[0]?.scene) {
      phaserGameRef.current.scene.scenes[0].scene.resume();
    }
    soundManager.playClick();
  };

  const handleRestart = () => {
    setIsPaused(false);
    if (level) {
      setLevel(level);
      const scene = phaserGameRef.current?.scene?.scenes[0];
      if (scene) {
        scene.scene.resume();
        scene.initLevel(level);
      }
    }
    soundManager.playClick();
  };

  const handleNextLevel = () => {
    const nextId = parseInt(level?.id, 10) + 1;
    navigate(`/game/${nextId}`);
  };

  const handleLevelSelect = () => {
    navigate('/levels');
  };

  const handleUseBoosterOnFail = () => {
    const ok = activateBooster('extraShot');
    if (ok) {
      setGameStatus(GAME_STATUS.READY);
      soundManager.playBooster();
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start p-2 sm:p-4 bg-slate-950 select-none overflow-hidden">
      {/* Game HUD */}
      <GameHUD onPause={handlePause} />

      {/* Phaser Canvas Container */}
      <div className="relative mt-2 flex items-center justify-center">
        <div
          ref={containerRef}
          id="phaser-game-container"
          className="w-[360px] sm:w-[480px] h-[510px] sm:h-[680px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800"
        />
      </div>

      {/* Pause Modal */}
      {isPaused && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onExit={handleLevelSelect}
        />
      )}

      {/* Victory Level Complete Modal */}
      {gameStatus === GAME_STATUS.LEVEL_COMPLETE && (
        <LevelCompleteModal
          onNextLevel={handleNextLevel}
          onReplay={handleRestart}
          onLevelSelect={handleLevelSelect}
        />
      )}

      {/* Game Over / Level Failed Modal */}
      {gameStatus === GAME_STATUS.LEVEL_FAILED && (
        <LevelFailedModal
          onRetry={handleRestart}
          onUseBooster={handleUseBoosterOnFail}
          onLevelSelect={handleLevelSelect}
        />
      )}
    </div>
  );
}
