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
  speakText: (text: string, delay?: number) => void;
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
      successAudio.volume = 0.8;
      hitAudio.volume = 0.5;
      
      // Critical for iOS - enable cross-origin and set proper attributes
      successAudio.crossOrigin = "anonymous";
      hitAudio.crossOrigin = "anonymous";
      successAudio.setAttribute('playsinline', 'true');
      hitAudio.setAttribute('playsinline', 'true');
      
      // For iOS - force audio context creation with user gesture
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioContext = new AudioContext();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
      }
      
      // Force load and enable audio on iOS with multiple attempts
      const enableAudio = async (audio: HTMLAudioElement) => {
        return new Promise((resolve) => {
          // Try to play immediately
          audio.muted = true;
          audio.currentTime = 0;
          audio.play()
            .then(() => {
              audio.pause();
              audio.currentTime = 0;
              audio.muted = false;
              resolve(true);
            })
            .catch(() => {
              // Fallback - just unmute and resolve
              audio.muted = false;
              resolve(true);
            });
        });
      };
      
      await Promise.all([
        enableAudio(successAudio),
        enableAudio(hitAudio)
      ]);
      
      set({ 
        successSound: successAudio, 
        hitSound: hitAudio, 
        isAudioInitialized: true 
      });
      
      console.log("🔊 Audio initialized successfully for iOS/iPad");
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
      // Stop any previous instances
      hitSound.pause();
      hitSound.currentTime = 0;
      
      // For iOS - ensure volume and play
      hitSound.volume = 0.5;
      
      // Play with iOS-friendly approach and better error handling
      const playPromise = hitSound.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log("🔊 Hit sound played successfully"))
          .catch(error => {
            console.log("Hit sound play prevented:", error);
            // Retry once for iOS
            setTimeout(() => {
              hitSound.play().catch(() => {});
            }, 100);
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
      // Stop any previous instances
      successSound.pause();
      successSound.currentTime = 0;
      
      // For iOS - ensure volume and play
      successSound.volume = 0.8;
      
      // Play with iOS-friendly approach and better error handling
      const playPromise = successSound.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log("🔊 Success sound played successfully"))
          .catch(error => {
            console.log("Success sound play prevented:", error);
            // Retry once for iOS
            setTimeout(() => {
              successSound.play().catch(() => {});
            }, 100);
          });
      }
    } catch (error) {
      console.log("Success sound error:", error);
    }
  },

  speakText: (text: string, delay: number = 0) => {
    const { isMuted } = get();
    if (isMuted || !('speechSynthesis' in window)) return;
    
    setTimeout(() => {
      try {
        // Stop any previous speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.8; // Slightly slower for toddlers
        utterance.volume = 0.9;
        utterance.pitch = 1.2; // Slightly higher pitch for children
        
        // Better error handling for speech synthesis
        utterance.onerror = (event) => {
          console.log("Speech synthesis error:", event);
        };
        
        utterance.onend = () => {
          console.log("🗣️ Speech completed:", text);
        };
        
        console.log("🗣️ Speaking:", text);
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.log("Speech synthesis failed:", error);
      }
    }, delay);
  }
}));
