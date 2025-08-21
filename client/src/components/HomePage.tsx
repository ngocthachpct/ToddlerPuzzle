import React, { useState } from "react";
import { useAudio } from "../lib/stores/useAudio";
import { useGameState } from "../lib/stores/useGameState";
import { gameTopics } from "../lib/gameData";

interface HomePageProps {
  onStartGame: (topicId: string) => void;
}

const HomePage = ({ onStartGame }: HomePageProps) => {
  const { isMuted, toggleMute } = useAudio();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    setTimeout(() => {
      onStartGame(topicId);
    }, 200);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 overflow-auto">
      {/* Header */}
      <div className="relative p-6">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-purple-700 mb-4 animate-bounce">
            🎮 Shadow Match Game
          </h1>
          <p className="text-2xl text-purple-600 mb-8">
            Drag and match animals to their shadows!
          </p>
        </div>

        {/* Sound Setting */}
        <div className="absolute top-6 right-6">
          <div className="bg-white/90 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-lg font-medium text-gray-700">Sound:</span>
              <button
                onClick={toggleMute}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full transition-all
                  ${isMuted 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }
                `}
              >
                {isMuted ? (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                      <line x1="22" y1="9" x2="16" y2="15"/>
                      <line x1="16" y1="9" x2="22" y2="15"/>
                    </svg>
                    <span className="font-medium">OFF</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    </svg>
                    <span className="font-medium">ON</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Test Speech Button */}
            {!isMuted && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Voice:</span>
                <button
                  onClick={() => {
                    const { testSpeech } = useAudio.getState();
                    testSpeech();
                  }}
                  className="px-3 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-full text-sm font-medium transition-all"
                >
                  Test Voice
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Topic Selection Grid */}
      <div className="px-6 pb-6">
        <h2 className="text-3xl font-bold text-center text-purple-700 mb-8">
          Choose a Topic to Play!
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {gameTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleTopicSelect(topic.id)}
              className={`
                bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transform transition-all duration-300
                hover:scale-105 active:scale-95 border-4
                ${selectedTopic === topic.id 
                  ? 'border-purple-400 bg-purple-50' 
                  : 'border-transparent hover:border-purple-200'
                }
              `}
            >
              <div className="text-center">
                <div className="text-6xl mb-4 animate-pulse">
                  {topic.emoji}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {topic.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {topic.description}
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {topic.items.slice(0, 5).map((item, index) => (
                    <span key={index} className="text-xs bg-gray-100 rounded-full px-2 py-1">
                      {item.name}
                    </span>
                  ))}
                  {topic.items.length > 5 && (
                    <span className="text-xs bg-gray-100 rounded-full px-2 py-1">
                      +{topic.items.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Floating decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            <div className="w-8 h-8 bg-white/30 rounded-full opacity-60" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;