let audioContext: AudioContext | null = null;

export const unlockReminderSound = () => {
  try {
    audioContext ??= new AudioContext();
    void audioContext.resume().catch(() => {});
  } catch {
    // Audio may be unavailable in this browser.
  }
};

export const playReminderSound = () => {
  unlockReminderSound();
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const start = audioContext.currentTime;

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, start);
  gain.gain.setValueAtTime(0.001, start);
  gain.gain.exponentialRampToValueAtTime(0.15, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, start + 1.5);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(start);
  oscillator.stop(start + 1.5);
};
