import { useState, useEffect } from "react";
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

  // Get current level data
  const currentItem = gameData.animals[currentLevel] || gameData.animals[0];
  
  // Create shadow targets (1 correct + 2-3 decoys)
  const shadowTargets = [
    currentItem, // Correct shadow
    ...gameData.animals
      .filter((_, index) => index !== currentLevel)
      .slice(0, 2) // Get 2 decoys
  ].sort(() => Math.random() - 0.5); // Shuffle positions

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = async (targetId: string, position: { x: number; y: number }) => {
    if (draggedItem === targetId) {
      // Correct match!
      setIsCorrectMatch(true);
      setEffectsPosition(position);
      setShowEffects(true);
      
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
      
      // Wait for effects, then advance to next level
      setTimeout(() => {
        setShowEffects(false);
        nextLevel();
      }, 2000);
      
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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex gap-8 justify-center flex-wrap max-w-4xl">
          {shadowTargets.map((target, index) => (
            <ShadowTarget
              key={`${target.id}-${index}`}
              item={target}
              onDrop={handleDrop}
              isDragOver={draggedItem === target.id}
            />
          ))}
        </div>
      </div>

      {/* Draggable image area */}
      <div className="h-64 flex items-center justify-center p-8">
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
