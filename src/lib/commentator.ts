// Drop into src/lib/commentator.ts
// Commentator voice via Web Speech API — free, no deps.

const CALLOUTS: Record<string, string[]> = {
  '180': ['One hundred and eighty!', 'One! Hundred! And eighty!'],
  'ton-40': ['One forty!', 'Big one! One forty!'],
  'ton': ['Ton!', 'Over the ton!', 'Big turn!'],
  't20': ['Treble twenty!', 'In the treble!'],
  'bull': ['Bullseye!', 'Right in the bull!'],
  'miss': ['Oh dear.', 'Off the board!', 'Uh oh.'],
  'low': ['Terrible turn.', 'Under ten. Dreadful.'],
  'bust': ['Bust!', "Oh, he's busted it."],
  'leg-win': ['Game shot!', 'Leg won!'],
  'set-win': ['Set over!', 'Takes the set.'],
  'match-win': ['Match!', 'And that! Is the match!'],
};

export function getCallout(type: string): string | null {
  const list = CALLOUTS[type];
  if (!list) return null;
  return list[Math.floor(Math.random() * list.length)];
}

class Commentator {
  private enabled = true;
  private voice: SpeechSynthesisVoice | null = null;
  private queue: string[] = [];
  private speaking = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.pickVoice();
      window.speechSynthesis.onvoiceschanged = () => this.pickVoice();
    }
  }

  private pickVoice() {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return;
    const prefs = ['Daniel', 'Google UK English Male', 'Microsoft George', 'Alex', 'Fred'];
    for (const name of prefs) {
      const v = voices.find(vv => vv.name.includes(name));
      if (v) { this.voice = v; return; }
    }
    this.voice = voices.find(v => v.lang?.startsWith('en')) || voices[0];
  }

  private flush() {
    if (!this.enabled || this.speaking || !this.queue.length) return;
    const text = this.queue.shift()!;
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    if (this.voice) u.voice = this.voice;
    u.pitch = 0.9; u.rate = 0.95; u.volume = 0.9;
    this.speaking = true;
    u.onend = () => { this.speaking = false; this.flush(); };
    u.onerror = () => { this.speaking = false; this.flush(); };
    window.speechSynthesis.speak(u);
  }

  say(text: string) {
    if (!this.enabled) return;
    this.queue.push(text);
    this.flush();
  }

  stop() {
    this.queue = [];
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    this.speaking = false;
  }

  setEnabled(v: boolean) {
    this.enabled = v;
    if (!v) this.stop();
  }
}

export const commentator = new Commentator();
