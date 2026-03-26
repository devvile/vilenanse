/**
 * Plays a subtle, premium success sound using the Web Audio API.
 * This avoids external dependencies and ensures fast playback.
 */
export function playSuccessSound() {
  if (typeof window === 'undefined') return;

  try {
    const audio = new Audio('/habbit-sound.mp3');
    audio.play().catch(error => {
      console.warn('Audio playback failed', error);
    });
  } catch (error) {
    console.warn('Audio playback initialization failed', error);
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
