// Fetches a reaction GIF for a given event type. Uses Giphy's public beta key by default;
// set VITE_GIPHY_KEY in .env for production.

const KEY = import.meta.env.VITE_GIPHY_KEY || 'dc6zaTOxFJmzC';
const ENDPOINT = 'https://api.giphy.com/v1/gifs/search';

const QUERIES: Record<string, string[]> = {
  '180':       ['darts 180', 'celebrate explosion', 'mind blown'],
  'ton-40':    ['darts celebrate', 'fist pump yes'],
  'ton':       ['celebrate fist pump', 'lets go yeah'],
  't20':       ['bullseye', 'nice shot'],
  'bull':      ['bullseye', 'target hit'],
  'bust':      ['fail facepalm', 'oh no', 'womp womp'],
  'miss':      ['miss throw fail', 'air ball'],
  'low':       ['shame cringe', 'awkward'],
  'leg-win':   ['celebrate winner', 'champion cheers'],
  'set-win':   ['victory fireworks', 'winner'],
  'match-win': ['championship trophy', 'epic win'],
};

interface GiphyImage { url?: string }
interface GiphyItem { images?: { fixed_height?: GiphyImage; downsized_medium?: GiphyImage } }
interface GiphyResponse { data?: GiphyItem[] }

const cache = new Map<string, string[]>();

export async function fetchReactionGif(type: string): Promise<string | null> {
  const list = QUERIES[type];
  if (!list) return null;
  const q = list[Math.floor(Math.random() * list.length)];
  if (cache.has(q)) {
    const pool = cache.get(q)!;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  try {
    const url = `${ENDPOINT}?api_key=${KEY}&q=${encodeURIComponent(q)}&limit=8&rating=pg-13`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as GiphyResponse;
    const items: string[] = (json.data ?? [])
      .map(it => it?.images?.fixed_height?.url || it?.images?.downsized_medium?.url)
      .filter((u): u is string => Boolean(u));
    if (!items.length) return null;
    cache.set(q, items);
    return items[Math.floor(Math.random() * items.length)];
  } catch {
    return null;
  }
}
