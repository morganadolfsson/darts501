// Commentator — SpeechSynthesis-based callouts. Works offline.
let enabled = true;
let voice: SpeechSynthesisVoice | null = null;
let queue: string[] = [];
let speaking = false;

function pickVoice(): SpeechSynthesisVoice | null {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const prefs = ['Daniel', 'Google UK English Male', 'Microsoft George', 'Alex', 'Fred'];
  for (const name of prefs) {
    const v = voices.find(vv => vv.name.includes(name));
    if (v) return v;
  }
  return voices.find(v => v.lang && v.lang.startsWith('en')) || voices[0];
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  voice = pickVoice();
  window.speechSynthesis.onvoiceschanged = () => { voice = pickVoice(); };
}

function flush() {
  if (!enabled || speaking || queue.length === 0) return;
  const text = queue.shift()!;
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.pitch = 0.9;
  u.rate = 0.95;
  u.volume = 0.9;
  speaking = true;
  u.onend = () => { speaking = false; flush(); };
  u.onerror = () => { speaking = false; flush(); };
  window.speechSynthesis.speak(u);
}

export const commentator = {
  say(text: string) {
    if (!enabled) return;
    queue.push(text);
    flush();
  },
  stop() {
    queue = [];
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    speaking = false;
  },
  setEnabled(v: boolean) {
    enabled = v;
    if (!v) this.stop();
  },
};

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
  'streak': ['He is on fire!', 'Three big turns on the bounce!'],
};

export function getCallout(type: string): string | null {
  const list = CALLOUTS[type];
  if (!list) return null;
  return list[Math.floor(Math.random() * list.length)];
}
