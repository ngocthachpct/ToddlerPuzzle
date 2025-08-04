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
    const targetArea = targetRect.width * targetRect.height;
    
    return (intersectionArea / targetArea) * 100;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
    
    // For desktop drag and drop, find the dragged element
    const draggedElements = document.querySelectorAll('[draggable="true"]');
    let draggedElement: Element | null = null;
    
    // Find the currently dragged element (usually the one with higher z-index or being dragged)
    draggedElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      const style = getComputedStyle(htmlElement);
      if (style.position === 'fixed' || style.zIndex === '1000') {
        draggedElement = htmlElement;
      }
    });
    
    if (draggedElement) {
      const draggedRect = (draggedElement as HTMLElement).getBoundingClientRect();
      const targetRect = e.currentTarget.getBoundingClientRect();
      const overlapPercentage = calculateOverlapPercentage(draggedRect, targetRect);
      
      // Only allow drop if overlap is >= 70%
      if (overlapPercentage >= 70) {
        const targetId = e.dataTransfer.getData('text/plain');
        const position = {
          x: targetRect.left + targetRect.width / 2,
          y: targetRect.top + targetRect.height / 2
        };
        
        onDrop(targetId, position);
      }
    } else {
      // Fallback for cases where we can't find the dragged element
      const targetId = e.dataTransfer.getData('text/plain');
      const rect = e.currentTarget.getBoundingClientRect();
      const position = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      
      onDrop(targetId, position);
    }
  };

  // Listen for touch drop events
  React.useEffect(() => {
    const handleTouchDrop = (e: CustomEvent) => {
      const { targetId, position } = e.detail;
      onDrop(targetId, position);
    };

    window.addEventListener('dragDrop', handleTouchDrop as EventListener);
    return () => window.removeEventListener('dragDrop', handleTouchDrop as EventListener);
  }, [onDrop]);

  return (
    <div
      className={`
        w-24 h-24 md:w-28 md:h-28 
        ${isMatched ? 'bg-white' : 'bg-white/50'} 
        rounded-2xl 
        ${isMatched ? 'border-4 border-solid border-green-400' : 'border-4 border-dashed'}
        flex items-center justify-center
        transition-all duration-200
        ${isHovered || isDragOver ? 'border-blue-400 bg-blue-100/50 scale-105' : isMatched ? 'border-green-400' : 'border-gray-300'}
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
