import { useEffect, useState } from "react";

interface VisualEffectsProps {
  position: { x: number; y: number };
  isSuccess: boolean;
}

const VisualEffects = ({ position, isSuccess }: VisualEffectsProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Generate particles
    const newParticles = [];
    const particleCount = isSuccess ? 12 : 6;
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: position.x + (Math.random() - 0.5) * 100,
        y: position.y + (Math.random() - 0.5) * 100,
        delay: Math.random() * 0.5
      });
    }
    
    setParticles(newParticles);
  }, [position, isSuccess]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Main effect */}
      <div
        className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
          isSuccess ? 'animate-ping' : 'animate-bounce'
        }`}
        style={{ left: position.x, top: position.y }}
      >
        <div className={`text-6xl ${isSuccess ? 'animate-spin' : ''}`}>
          {isSuccess ? '✨' : '❌'}
        </div>
      </div>

      {/* Particle effects */}
      {isSuccess && particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-2xl animate-bounce"
          style={{
            left: particle.x,
            top: particle.y,
            animationDelay: `${particle.delay}s`,
            animationDuration: '1s',
          }}
        >
          {['🎊', '🌟', '💫', '⭐'][particle.id % 4]}
        </div>
      ))}

      {/* Success text */}
      {isSuccess && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-bounce"
          style={{ left: position.x, top: position.y - 80 }}
        >
          <div className="bg-green-500 text-white font-bold text-xl px-6 py-3 rounded-full shadow-lg">
            Excellent! 🎉
          </div>
        </div>
      )}

      {/* Failure text */}
      {!isSuccess && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
          style={{ left: position.x, top: position.y - 80 }}
        >
          <div className="bg-orange-400 text-white font-bold text-xl px-6 py-3 rounded-full shadow-lg">
            Try Again! 😊
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualEffects;
