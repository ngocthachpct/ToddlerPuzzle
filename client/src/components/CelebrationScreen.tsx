import { useEffect, useState } from "react";

interface CelebrationScreenProps {
  onRestart: () => void;
}

const CelebrationScreen = ({ onRestart }: CelebrationScreenProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content with animation delay
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-yellow-200 to-orange-200 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            <div className="w-4 h-4 bg-yellow-400 rounded-full opacity-70" />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className={`
        text-center z-10 transition-all duration-1000 transform
        ${showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}
      `}>
        {/* Success emoji */}
        <div className="text-8xl mb-8 animate-pulse">
          🎉
        </div>

        {/* Congratulations text */}
        <h1 className="text-6xl font-bold text-orange-600 mb-8 animate-bounce">
          Great Job!
        </h1>

        {/* Stars */}
        <div className="flex justify-center gap-4 mb-12">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="text-6xl animate-spin"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              ⭐
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-6 justify-center">
          <button
            onClick={onRestart}
            className="bg-green-500 hover:bg-green-600 text-white font-bold text-2xl px-8 py-4 rounded-2xl shadow-lg transform transition-all hover:scale-105 active:scale-95"
          >
            Play Again! 🔄
          </button>
        </div>
      </div>

      {/* Floating hearts */}
      <div className="absolute bottom-0 left-0 w-full">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl animate-ping"
            style={{
              left: `${20 + i * 15}%`,
              bottom: `${Math.random() * 20}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          >
            💖
          </div>
        ))}
      </div>
    </div>
  );
};

export default CelebrationScreen;
