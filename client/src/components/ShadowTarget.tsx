import React, { useState } from "react";
import { GameItem } from "../lib/gameData";

interface ShadowTargetProps {
  item: GameItem;
  onDrop: (targetId: string, position: { x: number; y: number }) => void;
  isDragOver: boolean;
  isMatched: boolean;
}

const ShadowTarget = ({ item, onDrop, isDragOver, isMatched }: ShadowTargetProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log(`🎯 ShadowTarget ${item.id}:`, { isMatched, isDragOver });
  }, [isMatched, isDragOver, item.id]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(true);
  };

  const handleDragLeave = () => {
    setIsHovered(false);
  };

  const calculateOverlapPercentage = (draggedRect: DOMRect, targetRect: DOMRect): number => {
    // Calculate intersection area
    const left = Math.max(draggedRect.left, targetRect.left);
    const right = Math.min(draggedRect.right, targetRect.right);
    const top = Math.max(draggedRect.top, targetRect.top);
    const bottom = Math.min(draggedRect.bottom, targetRect.bottom);
    
    // No overlap if any dimension is negative
    if (left >= right || top >= bottom) return 0;
    
    const intersectionArea = (right - left) * (bottom - top);
    const draggedItemArea = draggedRect.width * draggedRect.height;
    
    // Safety check to prevent division by zero
    if (draggedItemArea === 0) return 0;
    
    // Return percentage of dragged item that covers the shadow
    return (intersectionArea / draggedItemArea) * 100;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
    
    const draggedItemId = e.dataTransfer.getData('text/plain');
    const rect = e.currentTarget.getBoundingClientRect();
    
    if (draggedItemId === item.id) {
      // Correct match
      const position = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      onDrop(draggedItemId, position);
    } else {
      // Wrong match - dispatch wrong-match event
      const position = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      onDrop('wrong-match', position);
    }
  };

  // Listen for touch drop events
  React.useEffect(() => {
    const handleTouchDrop = (e: CustomEvent) => {
      const { targetId, position } = e.detail;
      console.log('🎯 ShadowTarget received touch drop:', { targetId, itemId: item.id, position });
      
      // Only handle correct matches for this specific shadow target
      if (targetId === item.id) {
        console.log('✅ Touch drop match for', item.id);
        onDrop(targetId, position);
      }
      // Note: wrong-match events are handled by GameBoard directly
    };

    window.addEventListener('dragDrop', handleTouchDrop as EventListener);
    return () => window.removeEventListener('dragDrop', handleTouchDrop as EventListener);
  }, [onDrop, item.id]);

  return (
    <div
      className={`
        shadow-target
        w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40
        ${isMatched ? 'bg-white' : 'bg-white/50'} 
        rounded-2xl 
        ${isMatched ? 'border-4 border-solid border-green-400' : 'border-4 border-dashed'}
        flex items-center justify-center
        transition-all duration-200
        ${isHovered || isDragOver ? 'border-blue-400 bg-blue-100/50 scale-105' : isMatched ? 'border-green-400' : 'border-gray-300'}
        touch-none select-none
      `}
      data-shadow-target="true"
      data-target-id={item.id}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="w-full h-full p-2 flex items-center justify-center">
        <img
          src={isMatched ? item.image : item.shadow}
          alt={isMatched ? item.name : `${item.name} shadow`}
          className={`w-full h-full object-contain ${isMatched ? 'opacity-100' : 'opacity-60'}`}
          draggable={false}
        />
      </div>
    </div>
  );
};

export default ShadowTarget;
