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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
    
    const targetId = e.dataTransfer.getData('text/plain');
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    
    onDrop(targetId, position);
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
