import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  isAudioInitialized: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  initializeAudio: () => Promise<void>;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: false, // Start unmuted so sounds can play
  isAudioInitialized: false,
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  
  initializeAudio: async () => {
    const state = get();
    if (state.isAudioInitialized) return;
    
    try {
      // Load and prepare audio files with iOS optimization
      const successAudio = new Audio("/sounds/success.mp3");
      const hitAudio = new Audio("/sounds/hit.mp3");
      
      // iOS Safari optimization
      successAudio.preload = "auto";
      hitAudio.preload = "auto";
      successAudio.volume = 0.7;
      hitAudio.volume = 0.3;
      
      // For iOS - create a silent play to initialize audio context
      const initPromises = [];
      
      // Play a very short silent sound to enable audio on iOS
      successAudio.muted = true;
      hitAudio.muted = true;
      
      initPromises.push(
        successAudio.play().then(() => {
          successAudio.pause();
          successAudio.currentTime = 0;
          successAudio.muted = false;
        }).catch(() => {})
      );
      
      initPromises.push(
        hitAudio.play().then(() => {
          hitAudio.pause();
          hitAudio.currentTime = 0;
          hitAudio.muted = false;
        }).catch(() => {})
      );
      
      await Promise.all(initPromises);
      
      set({ 
        successSound: successAudio, 
        hitSound: hitAudio, 
        isAudioInitialized: true 
      });
      
      console.log("Audio initialized successfully for iOS/iPad");
    } catch (error) {
      console.log("Audio initialization failed:", error);
      set({ isAudioInitialized: true }); // Mark as initialized even if failed
    }
  },
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    // Just update the muted state
    set({ isMuted: newMutedState });
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted, isAudioInitialized } = get();
    if (!isAudioInitialized || !hitSound || isMuted) return;
    
    try {
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.currentTime = 0;
      
      // Play with iOS-friendly approach
      const playPromise = soundClone.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Hit sound play prevented:", error);
        });
      }
    } catch (error) {
      console.log("Hit sound error:", error);
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted, isAudioInitialized } = get();
    if (!isAudioInitialized || !successSound || isMuted) return;
    
    try {
      // Clone the sound to allow overlapping playback
      const soundClone = successSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.7; // Louder volume for success
      soundClone.currentTime = 0;
      
      // Play with iOS-friendly approach
      const playPromise = soundClone.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Success sound play prevented:", error);
        });
      }
    } catch (error) {
      console.log("Success sound error:", error);
    }
  }
}));
