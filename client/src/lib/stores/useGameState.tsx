import { create } from "zustand";
import { gameData } from "../gameData";

interface GameState {
  currentLevel: number;
  isGameComplete: boolean;
  
  // Actions
  nextLevel: () => void;
  resetLevel: () => void;
  resetGame: () => void;
}

export const useGameState = create<GameState>((set, get) => ({
  currentLevel: 0,
  isGameComplete: false,
  
  nextLevel: () => set((state) => {
    const nextLevel = state.currentLevel + 1;
    const isComplete = nextLevel >= gameData.animals.length;
    
    return {
      currentLevel: isComplete ? state.currentLevel : nextLevel,
      isGameComplete: isComplete
    };
  }),
  
  resetLevel: () => {
    // Just reset position, don't change level
    // This is handled by the draggable component
  },
  
  resetGame: () => set({
    currentLevel: 0,
    isGameComplete: false
  })
}));
