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

const GameBoard: React.FC<GameBoardProps> = ({ 
  selectedTopic = 'domestic-animals'
}) => {
  const { 
    currentLevel, 
    nextLevel, 
    resetLevel, 
    isGameComplete 
  } = useGameState();
  
  const { playHit, playSuccess, speakText } = useAudio();
  
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
    const shadowCount = topicItems.length;
    
    // Enhanced grid-based approach with guaranteed no overlap
    const gridCols = Math.ceil(Math.sqrt(shadowCount));
    const gridRows = Math.ceil(shadowCount / gridCols);
    
    // Calculate available space accounting for shadow size
    const shadowWidth = 12; // Approximate width percentage of each shadow
    const shadowHeight = 12; // Approximate height percentage of each shadow
    const margin = 2; // Minimum margin between shadows
    
    const availableWidth = 80; // Use 80% of screen width
    const availableHeight = 60; // Use 60% of screen height
    
    const cellWidth = availableWidth / gridCols;
    const cellHeight = availableHeight / gridRows;
    
    // Ensure minimum cell size to prevent overlap
    const minCellWidth = shadowWidth + margin;
    const minCellHeight = shadowHeight + margin;
    
    const actualCellWidth = Math.max(cellWidth, minCellWidth);
    const actualCellHeight = Math.max(cellHeight, minCellHeight);
    
    for (let i = 0; i < shadowCount; i++) {
      const gridX = i % gridCols;
      const gridY = Math.floor(i / gridCols);
      
      // Center position in each cell with guaranteed spacing
      const baseX = 10 + gridX * actualCellWidth + actualCellWidth / 2;
      const baseY = 10 + gridY * actualCellHeight + actualCellHeight / 2;
      
      // Add very small random offset (within safe bounds)
      const maxOffset = Math.min(actualCellWidth * 0.1, actualCellHeight * 0.1);
      const randomX = baseX + (Math.random() - 0.5) * maxOffset;
      const randomY = baseY + (Math.random() - 0.5) * maxOffset;
      
      const position = {
        x: Math.max(8, Math.min(92 - shadowWidth, randomX)), // Ensure within bounds
        y: Math.max(8, Math.min(72 - shadowHeight, randomY))
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
  
  // Speak the item name when level changes (after a brief delay)
  useEffect(() => {
    if (currentItem?.name) {
      speakText(`Find the ${currentItem.name}`, 1500); // Delay to let transition complete
    }
  }, [currentLevel, currentItem?.name, speakText]);
  
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
      
      // Play voice prompt using the new speakText function
      speakText(currentItem.name, 800); // Delay to let success sound play first
      
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

      {/* Draggable image area - positioned at bottom left corner with enough margin */}
      <div className="absolute bottom-8 left-8 z-20 sm:bottom-12 sm:left-12">
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
