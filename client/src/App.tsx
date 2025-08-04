import { useState, useEffect } from "react";
import GameBoard from "./components/GameBoard";
import CelebrationScreen from "./components/CelebrationScreen";
import { useGameState } from "./lib/stores/useGameState";
import { useAudio } from "./lib/stores/useAudio";
import "./index.css";

function App() {
  const { currentLevel, isGameComplete, resetGame } = useGameState();
  const { setSuccessSound, setHitSound, isMuted, toggleMute } = useAudio();
  const [showCelebration, setShowCelebration] = useState(false);

  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      try {
        // Load success sound
        const successAudio = new Audio("/sounds/success.mp3");
        successAudio.preload = "auto";
        setSuccessSound(successAudio);

        // Load wrong sound
        const wrongAudio = new Audio("/sounds/wrong.mp3");
        wrongAudio.preload = "auto";
        setHitSound(wrongAudio);
      } catch (error) {
        console.log("Audio loading failed:", error);
      }
    };

    initAudio();
  }, [setSuccessSound, setHitSound]);

  // Show celebration when game is complete
  useEffect(() => {
    if (isGameComplete) {
      setShowCelebration(true);
    }
  }, [isGameComplete]);

  const handleRestart = () => {
    setShowCelebration(false);
    resetGame();
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-200 via-green-100 to-yellow-50 overflow-hidden">
      {/* Back button for parents */}
      <button
        onClick={handleRestart}
        className="absolute top-4 left-4 z-50 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all"
        aria-label="Back"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Sound toggle button */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 z-50 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all"
        aria-label="Toggle Sound"
      >
        {isMuted ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z"/>
            <line x1="22" y1="9" x2="16" y2="15"/>
            <line x1="16" y1="9" x2="22" y2="15"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 5L6 9H2v6h4l5 4V5z"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        )}
      </button>

      {showCelebration ? (
        <CelebrationScreen onRestart={handleRestart} />
      ) : (
        <GameBoard />
      )}
    </div>
  );
}

export default App;
