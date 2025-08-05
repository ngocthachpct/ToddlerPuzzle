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
    // Generate random positions for shadows
    generateRandomPositions();
  }, [selectedTopic, topicItems.length]);

  // Listen for wrong-match touch events
  React.useEffect(() => {
    const handleWrongMatchEvent = (e: CustomEvent) => {
      const { targetId, position } = e.detail;
      
      // Only handle wrong-match events
      if (targetId === 'wrong-match') {
        console.log('❌ GameBoard handling wrong-match event');
        handleDrop('wrong-match', position);
      }
    };

    window.addEventListener('dragDrop', handleWrongMatchEvent as EventListener);
    return () => window.removeEventListener('dragDrop', handleWrongMatchEvent as EventListener);
  }, []);

  // Random positions for shadows
  const [shadowPositions, setShadowPositions] = React.useState<Array<{x: number, y: number}>>([]);

  const generateRandomPositions = () => {
    const positions: Array<{x: number, y: number}> = [];
    const shadowCount = topicItems.length; // Show ALL shadows, not limited
    
    // Use a more reliable grid-based approach
    const gridCols = Math.ceil(Math.sqrt(shadowCount));
    const gridRows = Math.ceil(shadowCount / gridCols);
    const cellWidth = 70 / gridCols; // Use more screen width
    const cellHeight = 55 / gridRows; // Use more screen height
    
    for (let i = 0; i < shadowCount; i++) {
      const gridX = i % gridCols;
      const gridY = Math.floor(i / gridCols);
      
      // Calculate base position in grid cell
      const baseX = 10 + gridX * cellWidth + cellWidth / 2;
      const baseY = 10 + gridY * cellHeight + cellHeight / 2;
      
      // Add small random offset within cell bounds
      const randomX = baseX + (Math.random() - 0.5) * (cellWidth * 0.3);
      const randomY = baseY + (Math.random() - 0.5) * (cellHeight * 0.3);
      
      const position = {
        x: Math.max(8, Math.min(85, randomX)), // Clamp to safe bounds
        y: Math.max(8, Math.min(65, randomY))
      };
      
      positions.push(position);
    }
    
    setShadowPositions(positions);
  };

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
    console.log('🎯 Drop event:', { targetId, draggedItem, position });
    
    if (targetId === 'wrong-match') {
      // Wrong match - show error effects
      console.log('❌ Wrong match detected');
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
      console.log('✅ Correct match! Adding to matched items:', targetId);
      setIsCorrectMatch(true);
      setEffectsPosition(position);
      setShowEffects(true);
      
      // Add to matched items so shadow gets replaced
      setMatchedItems(prev => {
        const newSet = new Set(prev);
        newSet.add(targetId);
        console.log('🔄 Updated matched items:', Array.from(newSet));
        return newSet;
      });
      
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
      
      // Wait for effects, then move to next level
      setTimeout(() => {
        setShowEffects(false);
        nextLevel(); // Always go to next level after correct match
      }, 2000);
      
    } else if (draggedItem === targetId && matchedItems.has(targetId)) {
      // Already matched - just reset without effects
      console.log('⚠️ Item already matched:', targetId);
      resetLevel();
    } else {
      // Wrong item on correct shadow - treat as wrong match
      console.log('❌ Wrong item on shadow:', { draggedItem, targetId });
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
    <div className="game-board-container w-full h-full flex flex-col relative bg-gradient-to-b from-green-200 via-blue-100 to-yellow-100">
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
      
      {/* Shadow targets area - random positioned shadows */}
      <div className="flex-1 relative px-2 py-4 sm:px-4 sm:py-6 z-10 min-h-0 overflow-hidden">
        {shadowTargets.map((target, index) => {
          // Ensure we have a position for this shadow, create one if missing
          let position = shadowPositions[index];
          if (!position) {
            // Fallback position if not generated properly
            position = {
              x: 20 + (index % 4) * 20, // Simple fallback grid
              y: 20 + Math.floor(index / 4) * 25
            };
          }
          
          return (
            <div
              key={`${target.id}-${index}`}
              className="absolute"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <ShadowTarget
                item={target}
                onDrop={handleDrop}
                isDragOver={draggedItem === target.id}
                isMatched={matchedItems.has(target.id)}
              />
            </div>
          );
        })}
      </div>

      {/* Draggable image area - positioned at bottom left corner */}
      <div className="absolute bottom-4 left-4 z-20">
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
