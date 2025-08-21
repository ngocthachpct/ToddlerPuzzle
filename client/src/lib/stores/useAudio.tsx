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
  testSpeech: () => void;
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
      
      // Initialize speech synthesis for iOS/Safari
      if ('speechSynthesis' in window) {
        // Force load voices by calling getVoices
        const voices = speechSynthesis.getVoices();
        console.log("🗣️ Speech synthesis available, voices loaded:", voices.length);
        
        // If no voices loaded yet, wait for them
        if (voices.length === 0) {
          speechSynthesis.addEventListener('voiceschanged', () => {
            const newVoices = speechSynthesis.getVoices();
            console.log("🗣️ Voices loaded after change:", newVoices.length);
          }, { once: true });
        }
      }
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
    if (isMuted) {
      console.log("🗣️ Speech skipped (muted)");
      return;
    }
    
    if (!('speechSynthesis' in window)) {
      console.log("🗣️ Speech synthesis not supported on this device");
      return;
    }
    
    setTimeout(() => {
      try {
        // Stop any previous speech
        speechSynthesis.cancel();
        
        // Wait for voices to load on iOS/Safari
        const speakWithVoice = () => {
          const voices = speechSynthesis.getVoices();
          console.log("🗣️ Available voices:", voices.length);
          
          const utterance = new SpeechSynthesisUtterance(text);
          
          // Try to find an English voice, prefer US English
          const englishVoices = voices.filter(voice => 
            voice.lang.startsWith('en-') || voice.lang === 'en'
          );
          
          let selectedVoice = null;
          if (englishVoices.length > 0) {
            // Prefer US English, then UK English, then any English
            selectedVoice = 
              englishVoices.find(v => v.lang === 'en-US') ||
              englishVoices.find(v => v.lang === 'en-GB') ||
              englishVoices[0];
          }
          
          if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang;
            console.log("🗣️ Using voice:", selectedVoice.name, selectedVoice.lang);
          } else {
            utterance.lang = 'en-US';
            console.log("🗣️ Using default en-US voice");
          }
          
          utterance.rate = 0.7; // Slower for toddlers
          utterance.volume = 1.0; // Full volume
          utterance.pitch = 1.1; // Slightly higher pitch for children
          
          // Enhanced error handling for speech synthesis
          utterance.onerror = (event) => {
            console.log("🗣️ Speech synthesis error:", event.error, event);
          };
          
          utterance.onstart = () => {
            console.log("🗣️ Speech started:", text);
          };
          
          utterance.onend = () => {
            console.log("🗣️ Speech completed:", text);
          };
          
          console.log("🗣️ Attempting to speak:", text);
          speechSynthesis.speak(utterance);
          
          // Fallback for iOS - sometimes needs a resume
          setTimeout(() => {
            if (speechSynthesis.paused) {
              console.log("🗣️ Resuming speech synthesis");
              speechSynthesis.resume();
            }
          }, 100);
        };
        
        // Check if voices are already loaded
        if (speechSynthesis.getVoices().length > 0) {
          speakWithVoice();
        } else {
          // Wait for voices to load (important for iOS/Safari)
          console.log("🗣️ Waiting for voices to load...");
          speechSynthesis.addEventListener('voiceschanged', speakWithVoice, { once: true });
          
          // Fallback timeout in case voiceschanged doesn't fire
          setTimeout(() => {
            if (speechSynthesis.getVoices().length === 0) {
              console.log("🗣️ Voices still not loaded, trying anyway...");
            }
            speakWithVoice();
          }, 1000);
        }
        
      } catch (error) {
        console.log("🗣️ Speech synthesis failed:", error);
      }
    }, delay);
  },

  testSpeech: () => {
    const { speakText } = get();
    console.log("🗣️ Testing speech synthesis...");
    speakText("Hello! Speech is working.", 0);
  }
}));
