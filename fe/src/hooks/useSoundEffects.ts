import { useState, useEffect, useCallback, useRef } from 'react';

const SOUND_KEY = 'enlist-sounds-enabled';

function getInitialSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(SOUND_KEY);
  return stored === null ? true : stored === 'true';
}

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    audioContext = new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    )();
  }
  return audioContext;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.15,
  startTime: number = 0
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startTime);

  gainNode.gain.setValueAtTime(0, ctx.currentTime + startTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + startTime + 0.01);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + startTime + duration);

  oscillator.start(ctx.currentTime + startTime);
  oscillator.stop(ctx.currentTime + startTime + duration);
}

function playSuccessChime(): void {
  playTone(523.25, 0.15, 'sine', 0.12);
  playTone(659.25, 0.15, 'sine', 0.12, 0.1);
  playTone(783.99, 0.2, 'sine', 0.12, 0.2);
}

function playPerfectFanfare(): void {
  playTone(523.25, 0.12, 'sine', 0.1);
  playTone(659.25, 0.12, 'sine', 0.1, 0.08);
  playTone(783.99, 0.12, 'sine', 0.1, 0.16);
  playTone(1046.5, 0.3, 'sine', 0.12, 0.24);
  playTone(783.99, 0.1, 'triangle', 0.06, 0.24);
  playTone(659.25, 0.1, 'triangle', 0.06, 0.24);
}

function playAchievementUnlock(): void {
  for (let i = 0; i < 4; i++) {
    playTone(1200 + i * 200, 0.08, 'sine', 0.08, i * 0.05);
  }
  playTone(880, 0.25, 'triangle', 0.1, 0.2);
}

function playStreakMilestone(): void {
  playTone(392, 0.15, 'triangle', 0.1);
  playTone(493.88, 0.15, 'triangle', 0.1, 0.12);
  playTone(587.33, 0.25, 'triangle', 0.12, 0.24);
}

export function useSoundEffects() {
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(getInitialSoundEnabled);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    localStorage.setItem(SOUND_KEY, String(soundEnabled));
  }, [soundEnabled]);

  const toggleSounds = useCallback(() => {
    setSoundEnabledState((prev) => !prev);
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
  }, []);

  const playSuccessSound = useCallback(() => {
    if (!soundEnabledRef.current) return;
    playSuccessChime();
  }, []);

  const playPerfectSound = useCallback(() => {
    if (!soundEnabledRef.current) return;
    playPerfectFanfare();
  }, []);

  const playAchievementSound = useCallback(() => {
    if (!soundEnabledRef.current) return;
    playAchievementUnlock();
  }, []);

  const playStreakSound = useCallback(() => {
    if (!soundEnabledRef.current) return;
    playStreakMilestone();
  }, []);

  return {
    soundEnabled,
    toggleSounds,
    setSoundEnabled,
    playSuccessSound,
    playPerfectSound,
    playAchievementSound,
    playStreakSound,
  };
}
