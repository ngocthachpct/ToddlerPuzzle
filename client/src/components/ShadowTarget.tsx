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
      // Only handle drop if it's for this specific shadow target
      if (targetId === item.id) {
        onDrop(targetId, position);
      }
    };

    window.addEventListener('dragDrop', handleTouchDrop as EventListener);
    return () => window.removeEventListener('dragDrop', handleTouchDrop as EventListener);
  }, [onDrop, item.id]);

  return (
    <div
      className={`
        shadow-target
        w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32
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
      <img
        src={isMatched ? item.image : item.shadow}
        alt={isMatched ? item.name : `${item.name} shadow`}
        className={`w-full h-full object-contain ${isMatched ? 'opacity-100' : 'opacity-60'}`}
        draggable={false}
      />
    </div>
  );
};

export default ShadowTarget;
