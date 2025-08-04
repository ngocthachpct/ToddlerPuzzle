import { useState, useRef } from "react";
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
    const targetArea = targetRect.width * targetRect.height;
    
    return (intersectionArea / targetArea) * 100;
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
    let bestMatch: { targetId: string; overlapPercentage: number; position: { x: number; y: number } } | null = null;
    
    shadowTargets.forEach(shadowTarget => {
      const targetRect = shadowTarget.getBoundingClientRect();
      const overlapPercentage = calculateOverlapPercentage(draggedRect, targetRect);
      
      if (overlapPercentage >= 70) {
        const targetId = shadowTarget.getAttribute('data-target-id');
        if (targetId && (!bestMatch || overlapPercentage > bestMatch.overlapPercentage)) {
          bestMatch = {
            targetId,
            overlapPercentage,
            position: {
              x: targetRect.left + targetRect.width / 2,
              y: targetRect.top + targetRect.height / 2
            }
          };
        }
      }
    });
    
    // Trigger drop event if we found a valid match
    if (bestMatch) {
      const event = new CustomEvent('dragDrop', {
        detail: {
          targetId: bestMatch.targetId,
          position: bestMatch.position
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
