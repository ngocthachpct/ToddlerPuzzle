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

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Check if dropped on a shadow target
    const shadowTarget = elementBelow?.closest('[data-shadow-target]');
    if (shadowTarget) {
      const targetId = shadowTarget.getAttribute('data-target-id');
      if (targetId) {
        // Import the handleDrop function from parent
        const event = new CustomEvent('dragDrop', {
          detail: {
            targetId,
            position: { x: touch.clientX, y: touch.clientY }
          }
        });
        window.dispatchEvent(event);
      }
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
