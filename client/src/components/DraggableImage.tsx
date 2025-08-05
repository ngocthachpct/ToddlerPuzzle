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
  const startTouchRef = useRef({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const rect = dragRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate offset from touch point to element top-left
    offsetRef.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };

    // Store initial touch position
    startTouchRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };

    setIsDragging(true);
    onDragStart(item.id);
    
    // Prevent default touch behaviors
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    
    // Calculate new position based on touch movement
    const deltaX = touch.clientX - startTouchRef.current.x;
    const deltaY = touch.clientY - startTouchRef.current.y;
    
    setPosition({ x: deltaX, y: deltaY });
    
    // Prevent default behaviors
    e.preventDefault();
    e.stopPropagation();
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

    // Get current touch position
    const touch = e.changedTouches[0];
    
    // Get the dragged element's current position
    const draggedElement = dragRef.current;
    if (!draggedElement) {
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
      onDragEnd();
      return;
    }
    
    // Get actual dragged element position on screen
    const draggedRect = draggedElement.getBoundingClientRect();
    
    console.log('🎯 Touch end - element position:', {
      rect: {
        left: draggedRect.left.toFixed(1),
        top: draggedRect.top.toFixed(1),
        width: draggedRect.width.toFixed(1),
        height: draggedRect.height.toFixed(1)
      },
      touch: {
        x: touch.clientX.toFixed(1),
        y: touch.clientY.toFixed(1)
      }
    });
    
    // Find all shadow targets and check overlap
    const shadowTargets = document.querySelectorAll('[data-shadow-target="true"]');
    console.log('🎯 Found shadow targets:', shadowTargets.length);
    
    interface MatchResult {
      targetId: string;
      overlapPercentage: number;
      position: { x: number; y: number };
    }
    
    let bestMatch: MatchResult | null = null;
    
    shadowTargets.forEach((shadowTarget, index) => {
      const targetRect = shadowTarget.getBoundingClientRect();
      const overlapPercentage = calculateOverlapPercentage(draggedRect, targetRect);
      const targetId = shadowTarget.getAttribute('data-target-id');
      
      console.log(`🎯 Shadow ${index} (${targetId}):`, {
        overlap: overlapPercentage.toFixed(1) + '%',
        isCorrectId: targetId === item.id,
        meetsThreshold: overlapPercentage >= 50
      });
      
      // Check for valid match (50% overlap + correct ID)
      if (overlapPercentage >= 50 && targetId && targetId === item.id) {
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
    
    // Dispatch appropriate event
    if (bestMatch) {
      // Correct match found
      console.log('✅ Best match found:', bestMatch);
      const event = new CustomEvent('dragDrop', {
        detail: {
          targetId: bestMatch.targetId,
          position: bestMatch.position
        }
      });
      window.dispatchEvent(event);
    } else {
      // No valid match - trigger wrong match effect
      console.log('❌ No valid match found');
      const event = new CustomEvent('dragDrop', {
        detail: {
          targetId: 'wrong-match',
          position: {
            x: draggedRect.left + draggedRect.width / 2,
            y: draggedRect.top + draggedRect.height / 2
          }
        }
      });
      window.dispatchEvent(event);
    }

    // Reset state
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
    onDragEnd();
    
    // Prevent default behaviors
    e.preventDefault();
    e.stopPropagation();
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

  // Detect if device supports touch - improved detection
  const isTouchDevice = React.useMemo(() => {
    // Check for touch support
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Check if we're on a mobile/tablet device
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    // For iPads specifically, they might report mouse support too
    const isIPad = /ipad/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    return hasTouch || isMobile || isIPad;
  }, []);

  return (
    <div
      ref={dragRef}
      className={`
        draggable-item relative select-none
        ${isDragging ? 'dragging scale-110 z-50' : 'hover:scale-105'}
      `}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        position: isDragging ? 'fixed' : 'relative',
        zIndex: isDragging ? 1000 : 1,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        cursor: isTouchDevice ? 'default' : (isDragging ? 'grabbing' : 'grab'),
      }}
      draggable={!isTouchDevice} // Enable HTML5 drag only for desktop
      // Touch events for iPad/mobile
      onTouchStart={isTouchDevice ? handleTouchStart : undefined}
      onTouchMove={isTouchDevice ? handleTouchMove : undefined}
      onTouchEnd={isTouchDevice ? handleTouchEnd : undefined}
      // Desktop drag events
      onDragStart={!isTouchDevice ? handleDragStart : undefined}
      onDragEnd={!isTouchDevice ? handleDragEndDesktop : undefined}
    >
      <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 bg-white rounded-2xl shadow-lg p-2 sm:p-3 flex items-center justify-center">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
      </div>
    </div>
  );
};

export default DraggableImage;
