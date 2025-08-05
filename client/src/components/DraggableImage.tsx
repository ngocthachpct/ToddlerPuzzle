import React, { useState, useRef } from "react";
import { GameItem } from "../lib/gameData";

interface DraggableImageProps {
  item: GameItem;
  onDragStart: (itemId: string) => void;
  onDragEnd: () => void;
}

const DraggableImage = ({ item, onDragStart, onDragEnd }: DraggableImageProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const rect = dragRef.current?.getBoundingClientRect();
    if (!rect) return;

    startPosRef.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };

    setIsDragging(true);
    onDragStart(item.id);
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const newX = touch.clientX - startPosRef.current.x;
    const newY = touch.clientY - startPosRef.current.y;
    
    setPosition({ x: newX, y: newY });
    e.preventDefault();
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

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.changedTouches[0];
    
    // Get the dragged item's current position and size
    const draggedElement = dragRef.current;
    if (!draggedElement) {
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
      onDragEnd();
      return;
    }
    
    const draggedRect = draggedElement.getBoundingClientRect();
    
    // Find all shadow targets and check overlap percentage
    const shadowTargets = document.querySelectorAll('[data-shadow-target="true"]');
    
    interface MatchResult {
      targetId: string;
      overlapPercentage: number;
      position: { x: number; y: number };
    }
    
    let bestMatch: MatchResult | null = null;
    
    shadowTargets.forEach(shadowTarget => {
      const targetRect = shadowTarget.getBoundingClientRect();
      const overlapPercentage = calculateOverlapPercentage(draggedRect, targetRect);
      const targetId = shadowTarget.getAttribute('data-target-id');
      
      // Store the best match regardless of ID, but only process if ID matches
      if (overlapPercentage >= 70 && targetId && targetId === item.id) {
        const currentMatch: MatchResult = {
          targetId,
          overlapPercentage,
          position: {
            x: targetRect.left + targetRect.width / 2,
            y: targetRect.top + targetRect.height / 2
          }
        };
        
        if (!bestMatch || overlapPercentage > bestMatch.overlapPercentage) {
          bestMatch = currentMatch;
        }
      }
    });
    
    // Trigger drop event if we found a valid match
    if (bestMatch !== null) {
      const matchResult = bestMatch as MatchResult;
      const event = new CustomEvent('dragDrop', {
        detail: {
          targetId: matchResult.targetId,
          position: matchResult.position
        }
      });
      window.dispatchEvent(event);
    } else {
      // No valid match found - trigger wrong match effect
      const event = new CustomEvent('dragDrop', {
        detail: {
          targetId: 'wrong-match', // Special indicator for wrong match
          position: {
            x: draggedRect.left + draggedRect.width / 2,
            y: draggedRect.top + draggedRect.height / 2
          }
        }
      });
      window.dispatchEvent(event);
    }

    // Reset position
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
    onDragEnd();
    e.preventDefault();
  };

  // Handle desktop drag and drop
  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(item.id);
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragEndDesktop = () => {
    setIsDragging(false);
    onDragEnd();
  };

  return (
    <div
      ref={dragRef}
      className={`
        relative cursor-move select-none transition-transform duration-200
        ${isDragging ? 'scale-110 z-50' : 'hover:scale-105'}
      `}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        position: isDragging ? 'fixed' : 'relative',
        zIndex: isDragging ? 1000 : 1,
      }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEndDesktop}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl shadow-lg p-4 flex items-center justify-center">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>
    </div>
  );
};

export default DraggableImage;
