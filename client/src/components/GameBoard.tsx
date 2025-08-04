import React, { useState, useEffect } from "react";
import DraggableImage from "./DraggableImage";
import ShadowTarget from "./ShadowTarget";
import VisualEffects from "./VisualEffects";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";
import { gameData, GameItem } from "../lib/gameData";

const GameBoard = () => {
  const { currentLevel, nextLevel, resetLevel } = useGameState();
  const { playSuccess, playHit } = useAudio();
  
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showEffects, setShowEffects] = useState(false);
  const [effectsPosition, setEffectsPosition] = useState({ x: 0, y: 0 });
  const [isCorrectMatch, setIsCorrectMatch] = useState(false);
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set());
  
  // Reset matched items and random order when starting a new game
  React.useEffect(() => {
    if (currentLevel === 0) {
      setMatchedItems(new Set());
      // Generate new random order for new game
      const shuffled = [...Array(gameData.animals.length)].map((_, i) => i)
        .sort(() => Math.random() - 0.5);
      setRandomOrder(shuffled);
    }
  }, [currentLevel]);

  // Get random item for draggable (not based on order)
  const [randomOrder, setRandomOrder] = useState<number[]>([]);
  
  // Initialize random order when component mounts
  React.useEffect(() => {
    if (randomOrder.length === 0) {
      const shuffled = [...Array(gameData.animals.length)].map((_, i) => i)
        .sort(() => Math.random() - 0.5);
      setRandomOrder(shuffled);
    }
  }, [randomOrder.length]);
  
  // Get current item from random order
  const currentItemIndex = randomOrder[currentLevel % gameData.animals.length] ?? 0;
  const currentItem = gameData.animals[currentItemIndex];
  
  // All 10 shadows are always displayed
  const shadowTargets = gameData.animals;

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = async (targetId: string, position: { x: number; y: number }) => {
    if (draggedItem === targetId && !matchedItems.has(targetId)) {
      // Correct match!
      setIsCorrectMatch(true);
      setEffectsPosition(position);
      setShowEffects(true);
      
      // Add to matched items so shadow gets replaced
      setMatchedItems(prev => new Set(Array.from(prev).concat(targetId)));
      
      // Play success sound
      playSuccess();
      
      // Play voice prompt
      try {
        const voiceAudio = new Audio(`/sounds/voice_${currentItem.id}.mp3`);
        setTimeout(() => {
          voiceAudio.play().catch(console.log);
        }, 500);
      } catch (error) {
        console.log("Voice audio not available:", error);
      }
      
      // Wait for effects, then check if all items are matched
      setTimeout(() => {
        setShowEffects(false);
        
        // Check if all 10 animals are matched
        if (matchedItems.size + 1 >= gameData.animals.length) {
          // All matched, proceed to celebration
          nextLevel();
        } else {
          // Continue with next animal
          nextLevel();
        }
      }, 2000);
      
    } else if (draggedItem === targetId && matchedItems.has(targetId)) {
      // Already matched - no effect, just reset
      resetLevel();
    } else {
      // Wrong match
      setIsCorrectMatch(false);
      setEffectsPosition(position);
      setShowEffects(true);
      
      // Play wrong sound
      playHit();
      
      // Reset after brief feedback
      setTimeout(() => {
        setShowEffects(false);
        resetLevel();
      }, 1000);
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative bg-gradient-to-b from-green-200 via-blue-100 to-yellow-100">
      {/* Farm/nature themed background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Clouds */}
        <div className="absolute top-8 left-20 w-16 h-8 bg-white rounded-full opacity-70"></div>
        <div className="absolute top-12 left-16 w-12 h-6 bg-white rounded-full opacity-70"></div>
        <div className="absolute top-6 right-32 w-20 h-10 bg-white rounded-full opacity-60"></div>
        <div className="absolute top-10 right-28 w-16 h-8 bg-white rounded-full opacity-60"></div>
        
        {/* Sun */}
        <div className="absolute top-8 right-8 w-12 h-12 bg-yellow-300 rounded-full opacity-80"></div>
        <div className="absolute top-6 right-6 w-16 h-16 border-4 border-yellow-200 rounded-full opacity-50"></div>
        
        {/* Grass/hills at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-green-300 to-transparent opacity-40"></div>
        
        {/* Trees */}
        <div className="absolute bottom-20 left-8 w-4 h-16 bg-amber-700 opacity-60"></div>
        <div className="absolute bottom-32 left-6 w-8 h-8 bg-green-500 rounded-full opacity-60"></div>
        <div className="absolute bottom-20 right-12 w-4 h-16 bg-amber-700 opacity-60"></div>
        <div className="absolute bottom-32 right-10 w-8 h-8 bg-green-500 rounded-full opacity-60"></div>
      </div>
      
      {/* Shadow targets area */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="grid grid-cols-5 gap-4 max-w-5xl">
          {shadowTargets.map((target, index) => (
            <ShadowTarget
              key={`${target.id}-${index}`}
              item={target}
              onDrop={handleDrop}
              isDragOver={draggedItem === target.id}
              isMatched={matchedItems.has(target.id)}
            />
          ))}
        </div>
      </div>

      {/* Draggable image area */}
      <div className="h-48 flex items-center justify-center p-8 relative z-10">
        <DraggableImage
          item={currentItem}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
      </div>

      {/* Visual effects */}
      {showEffects && (
        <VisualEffects
          position={effectsPosition}
          isSuccess={isCorrectMatch}
        />
      )}
    </div>
  );
};

export default GameBoard;
