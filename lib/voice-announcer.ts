/**
 * Bilingual Voice Token Announcer for Sri Lankan Rural Community Lounges
 * Uses the Web Speech API (speechSynthesis) - 100% Client-Side, Works Offline!
 * 
 * Specifically designed for rural elderly citizens, individuals with visual
 * impairments, and crowded community waiting halls in Ampitiya.
 */

export interface AnnouncementOptions {
  tokenNumber: string;
  clientName?: string;
  officerName?: string;
  counterRoom?: string;
  lang: 'si' | 'en';
}

export const playAudioChime = () => {
  if (typeof window === 'undefined') return;
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch {
    // Audio context not allowed or unsupported
  }
};

export const announceToken = (options: AnnouncementOptions) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  // Play attention chime first
  playAudioChime();

  setTimeout(() => {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const { tokenNumber, counterRoom, lang } = options;

    // Extract readable token numbers (e.g. GP-AMP-2026-0042 -> 42)
    const tokenDigits = tokenNumber.split('-').pop()?.replace(/^0+/, '') || tokenNumber;

    let phrase = '';
    let voiceLang = 'en-US';

    if (lang === 'si') {
      // Natural Sinhala announcement phrase
      phrase = `ටෝකන් අංක ${tokenDigits}. කරුණාකර ${counterRoom || 'පෙරමුණු මේසය'} වෙත පැමිණෙන්න.`;
      voiceLang = 'si-LK';
    } else {
      // Clear English announcement phrase
      phrase = `Token number ${tokenDigits}. Please proceed to ${counterRoom || 'Counter 01'}.`;
      voiceLang = 'en-US';
    }

    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.rate = 0.88; // Slightly slower, measured cadence for clear understanding in noisy halls
    utterance.pitch = 1.05;
    utterance.volume = 1.0;
    utterance.lang = voiceLang;

    // Attempt to select optimal voice if installed
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => v.lang.startsWith('si')) ||
      voices.find((v) => v.lang.includes('IN') || v.lang.includes('LK')) ||
      voices.find((v) => v.lang.startsWith('en'));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
  }, 350);

  return true;
};
