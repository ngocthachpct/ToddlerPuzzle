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
  
  // Reset matched items when starting a new game
  React.useEffect(() => {
    if (currentLevel === 0) {
      setMatchedItems(new Set());
    }
  }, [currentLevel]);

  // Get current level data - cycle through animals for the draggable item
  const currentItem = gameData.animals[currentLevel % gameData.animals.length];
  
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
    <div className="w-full h-full flex flex-col relative">
      {/* Shadow targets area */}
      <div className="flex-1 flex items-center justify-center p-4">
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
      <div className="h-48 flex items-center justify-center p-8">
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
