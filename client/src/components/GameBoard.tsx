import React, { useState, useEffect } from "react";
import DraggableImage from "./DraggableImage";
import ShadowTarget from "./ShadowTarget";
import VisualEffects from "./VisualEffects";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";
import { gameData, GameItem, gameTopics } from "../lib/gameData";

interface GameBoardProps {
  selectedTopic?: string;
}

const GameBoard = ({ selectedTopic = "domestic-animals" }: GameBoardProps) => {
  const { currentLevel, nextLevel, resetLevel } = useGameState();
  const { playSuccess, playHit, isMuted } = useAudio();
  
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showEffects, setShowEffects] = useState(false);
  const [effectsPosition, setEffectsPosition] = useState({ x: 0, y: 0 });
  const [isCorrectMatch, setIsCorrectMatch] = useState(false);
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set());
  
  // Get current topic data
  const currentTopic = gameTopics.find(topic => topic.id === selectedTopic) || gameTopics[0];
  const topicItems = currentTopic.items;

  // Reset matched items and random orders when starting a new game or changing topic
  React.useEffect(() => {
    setMatchedItems(new Set());
    // Generate new random order for draggable items
    const shuffledItems = [...Array(topicItems.length)].map((_, i) => i)
      .sort(() => Math.random() - 0.5);
    setRandomOrder(shuffledItems);
    // Generate new random order for shadow positions
    const shuffledShadows = [...topicItems].sort(() => Math.random() - 0.5);
    setShadowOrder(shuffledShadows);
  }, [selectedTopic, topicItems.length]);

  // Get random item for draggable (not based on order)
  const [randomOrder, setRandomOrder] = useState<number[]>([]);
  
  // Get current item from random order
  const currentItemIndex = randomOrder[currentLevel % topicItems.length] ?? 0;
  const currentItem = topicItems[currentItemIndex];
  
  // Randomize shadow positions on the grid
  const [shadowOrder, setShadowOrder] = useState<GameItem[]>([]);
  
  // Shadow targets from current topic
  const shadowTargets = shadowOrder.length > 0 ? shadowOrder : topicItems;

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = async (targetId: string, position: { x: number; y: number }) => {
    if (targetId === 'wrong-match') {
      // Wrong match - show error effects
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
      
    } else if (draggedItem === targetId && !matchedItems.has(targetId)) {
      // Correct match!
      setIsCorrectMatch(true);
      setEffectsPosition(position);
      setShowEffects(true);
      
      // Add to matched items so shadow gets replaced
      setMatchedItems(prev => new Set(Array.from(prev).concat(targetId)));
      
      // Play success sound
      console.log('🔊 Playing success sound for correct match');
      playSuccess();
      
      // Play voice prompt using Web Speech API (only if sound is not muted)
      setTimeout(() => {
        if (!isMuted && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(currentItem.name);
          utterance.lang = 'en-US';
          utterance.rate = 0.8; // Slightly slower for toddlers
          utterance.volume = 0.8;
          utterance.pitch = 1.2; // Slightly higher pitch for children
          
          // Stop any previous speech and speak the new word
          speechSynthesis.cancel();
          speechSynthesis.speak(utterance);
        } else if (isMuted) {
          console.log("Voice narration skipped (muted)");
        } else {
          console.log("Speech synthesis not supported");
        }
      }, 800); // Delay to let success sound play first
      
      // Wait for effects, then check if all items are matched
      setTimeout(() => {
        setShowEffects(false);
        
        // Check if all animals in topic are matched
        if (matchedItems.size + 1 >= topicItems.length) {
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
