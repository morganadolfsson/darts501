// Giphy fetcher — uses Giphy's public beta key.
const GIPHY_BETA_KEY = 'dc6zaTOxFJmzC';
const GIPHY_ENDPOINT = 'https://api.giphy.com/v1/gifs/search';

const QUERY_MAP: Record<string, string[]> = {
  '180':       ['darts 180', 'celebrate explosion', 'mind blown'],
  'ton-40':    ['darts celebrate', 'yes fist pump'],
  'ton':       ['celebrate fist pump', 'lets go yeah'],
  't20':       ['bullseye', 'nice shot'],
  'bull':      ['bullseye', 'target hit'],
  'bust':      ['fail facepalm', 'oh no', 'womp womp'],
  'miss':      ['miss throw fail', 'air ball'],
  'low':       ['shame cringe', 'awkward'],
  'leg-win':   ['celebrate winner', 'champion cheers'],
  'set-win':   ['victory fireworks', 'winner'],
  'match-win': ['championship trophy', 'epic win'],
  'streak':    ['on fire', 'hot streak'],
};

const gifCache = new Map<string, string[]>();

export async function fetchGif(type: string): Promise<string | null> {
  const queries = QUERY_MAP[type];
  if (!queries) return null;
  const q = queries[Math.floor(Math.random() * queries.length)];
  if (gifCache.has(q)) {
    const pool = gifCache.get(q)!;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  try {
    const url = `${GIPHY_ENDPOINT}?api_key=${GIPHY_BETA_KEY}&q=${encodeURIComponent(q)}&limit=8&rating=pg-13`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const items: string[] = (json.data || [])
      .map((it: { images?: { fixed_height?: { url?: string }; downsized_medium?: { url?: string } } }) =>
        it?.images?.fixed_height?.url || it?.images?.downsized_medium?.url)
      .filter((u: string | undefined): u is string => Boolean(u));
    if (!items.length) return null;
    gifCache.set(q, items);
    return items[Math.floor(Math.random() * items.length)];
  } catch (e) {
    console.warn('[giphy] fetch failed', e);
    return null;
  }
}
