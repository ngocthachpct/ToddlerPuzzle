import { useState, useEffect } from "react";
import HomePage from "./components/HomePage";
import GameBoard from "./components/GameBoard";
import CelebrationScreen from "./components/CelebrationScreen";
import { useGameState } from "./lib/stores/useGameState";
import { useAudio } from "./lib/stores/useAudio";
import { gameTopics } from "./lib/gameData";
import "./index.css";

function App() {
  const { currentLevel, isGameComplete, resetGame } = useGameState();
  const { isMuted, toggleMute, initializeAudio } = useAudio();
  const [currentScreen, setCurrentScreen] = useState<'home' | 'game' | 'celebration'>('home');
  const [selectedTopic, setSelectedTopic] = useState<string>('domestic-animals');
  const [showCelebration, setShowCelebration] = useState(false);

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleFirstInteraction = async () => {
      await initializeAudio();
      
      // Remove listeners after first interaction
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    // Add listeners for first user interaction (required for iOS)
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [initializeAudio]);

  // Show celebration when game is complete
  useEffect(() => {
    if (isGameComplete) {
      setShowCelebration(true);
    }
  }, [isGameComplete]);

  const handleStartGame = (topicId: string) => {
    setSelectedTopic(topicId);
    setCurrentScreen('game');
    setShowCelebration(false);
    resetGame();
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
    setShowCelebration(false);
    resetGame();
  };

  const handleRestart = () => {
    setShowCelebration(false);
    resetGame();
  };

  if (showCelebration) {
    return (
      <div className="w-full h-screen bg-gradient-to-b from-sky-200 via-green-100 to-yellow-50 overflow-hidden">
        <CelebrationScreen 
          onRestart={handleRestart}
          onBackToHome={handleBackToHome}
        />
      </div>
    );
  }

  if (currentScreen === 'home') {
    return <HomePage onStartGame={handleStartGame} />;
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-200 via-green-100 to-yellow-50 overflow-hidden">
      {/* Back button for parents */}
      <button
        onClick={handleBackToHome}
        className="absolute top-4 left-4 z-50 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all"
        aria-label="Back to Home"
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

      <GameBoard selectedTopic={selectedTopic} />
    </div>
  );
}

export default App;
