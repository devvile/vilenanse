/**
 * Plays a subtle, premium success sound using the Web Audio API.
 * This avoids external dependencies and ensures fast playback.
 */
export function playSuccessSound() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    
    // Create a smooth "ding" sound
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    // Soft sine wave
    oscillator.type = 'sine';
    
    // Start at 660Hz (E5) and slide up slightly for a positive feel
    oscillator.frequency.setValueAtTime(660, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.05);

    // Fade out quickly for a "pop" effect
    gainNode.gain.setValueAtTime(0.2, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.3);

    // Clean up context after sound finishes to free resources
    setTimeout(() => {
      context.close();
    }, 400);
  } catch (error) {
    console.warn('Audio playback failed', error);
  }
}

/**
 * Alternative "pop" sound for smaller interactions
 */
export function playPopSound() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, context.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.1);

    setTimeout(() => {
      context.close();
    }, 200);
  } catch (error) {
    console.warn('Audio playback failed', error);
  }
}
