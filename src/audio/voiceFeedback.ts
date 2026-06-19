let muted = false;
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function isVoiceMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  if (value && currentUtterance) {
    speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function speak(text: string, lang: string = 'en-US'): void {
  if (muted || !text || !('speechSynthesis' in window)) return;

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  currentUtterance = utterance;
  utterance.onend = () => { currentUtterance = null; };
  utterance.onerror = () => { currentUtterance = null; };

  speechSynthesis.speak(utterance);
}

export function stop(): void {
  speechSynthesis.cancel();
  currentUtterance = null;
}

export function prime(): void {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.getVoices();
}
