/**
 * Resolves a track to an ad-free audio clip on Apple's preview CDN.
 *
 * The iTunes Search API needs no key and answers with permissive CORS, and the
 * `.m4a` files it points at are served with `access-control-allow-origin: *`
 * and range support — so they play straight out of an `<audio>` element with
 * no iframe and no advertising in front of them. The trade is length: a preview
 * is roughly 30 seconds.
 *
 * Matching keys on the title alone. A snapshot row's `artist` is the YouTube
 * channel that uploaded the video ("Tips Official", "Shemaroo Filmi Gaane"),
 * not the singer, so feeding it to the search only adds noise.
 */

const ENDPOINT = 'https://itunes.apple.com/search';
/** The catalogue these playlists live in; a US search misses much of it. */
const STOREFRONT = 'IN';
const CACHE_KEY = 'safar.preview-cache.v1';
const REQUEST_TIMEOUT_MS = 8000;

/** Below this, the best candidate is a different song that shares a word. */
const MIN_SCORE = 0.45;

/** Tokens that describe the release rather than the song. */
const STOP_WORDS = new Set([
  'from',
  'feat',
  'ft',
  'version',
  'male',
  'female',
  'live',
  'the',
  'a',
  'and',
  'song',
  'title',
  'track',
  'remix',
  'part',
  'pt',
]);

export interface PreviewMatch {
  readonly url: string;
  /** Apple's title and performer — the real singer, unlike the channel name. */
  readonly title: string;
  readonly artist: string;
}

/** `null` is a cached "Apple has no clip for this", distinct from "not looked up yet". */
type CacheEntry = PreviewMatch | null;

const memory = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<CacheEntry>>();
let restored = false;

function tokens(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token && !STOP_WORDS.has(token)),
  );
}

/** Dice coefficient over title words: symmetric, so neither side's padding dominates. */
function similarity(a: string, b: string): number {
  const left = tokens(a);
  const right = tokens(b);
  if (!left.size || !right.size) return 0;

  let shared = 0;
  for (const token of left) if (right.has(token)) shared++;
  return (2 * shared) / (left.size + right.size);
}

/**
 * Search terms to try, widest first. Snapshot titles carry Devanagari duplicates
 * of the same name and trailing "- Movie (1983)" clauses; both throw the search
 * off, so a trimmed retry follows the literal one.
 */
function searchTerms(title: string): string[] {
  const latin = title
    .replace(/[^\p{Script=Latin}\p{Nd}\s'()&-]/gu, ' ')
    .replace(/\((?:19|20)\d{2}\)/g, ' ')
    .replace(/[-–—\s]{2,}/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/[-–—]\s*$/, '')
    .trim();

  const firstClause = latin.split(/\s+[-–—]\s+/)[0].trim();
  const terms = [latin];
  if (firstClause && firstClause !== latin) terms.push(firstClause);
  return terms.filter((term) => term.length >= 3);
}

function readCache(): void {
  if (restored) return;
  restored = true;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return;
    for (const [id, entry] of Object.entries(JSON.parse(raw) as Record<string, CacheEntry>)) {
      memory.set(id, entry);
    }
  } catch {
    // A corrupt or unavailable store just means every lookup goes to the network.
  }
}

function writeCache(): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(memory)));
  } catch {
    // Private mode or a full quota: the in-memory map still serves this session.
  }
}

async function search(term: string): Promise<readonly Record<string, unknown>[]> {
  const url =
    `${ENDPOINT}?term=${encodeURIComponent(term)}` + `&entity=song&limit=10&country=${STOREFRONT}`;

  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`iTunes search failed: ${response.status}`);

  // The endpoint answers as text/javascript, so `response.json()` refuses it.
  const body = JSON.parse(await response.text()) as { results?: Record<string, unknown>[] };
  return body.results ?? [];
}

async function lookup(title: string): Promise<CacheEntry> {
  for (const term of searchTerms(title)) {
    let results: readonly Record<string, unknown>[];
    try {
      results = await search(term);
    } catch {
      return null;
    }

    let best: (PreviewMatch & { score: number }) | null = null;
    for (const result of results) {
      const url = result['previewUrl'];
      const name = result['trackName'];
      if (typeof url !== 'string' || typeof name !== 'string') continue;

      const score = similarity(term, name);
      if (best && score <= best.score) continue;
      best = {
        score,
        url,
        title: name,
        artist: typeof result['artistName'] === 'string' ? result['artistName'] : 'Unknown artist',
      };
    }

    if (best && best.score >= MIN_SCORE) {
      return { url: best.url, title: best.title, artist: best.artist };
    }
  }
  return null;
}

/**
 * The ad-free clip for a track, or `null` when Apple's catalogue has no match.
 * Results — including misses — are cached in memory and `localStorage`, and
 * concurrent callers for the same track share one request.
 */
export function resolvePreview(trackId: string, title: string): Promise<CacheEntry> {
  readCache();

  const cached = memory.get(trackId);
  if (cached !== undefined) return Promise.resolve(cached);

  const pending = inFlight.get(trackId);
  if (pending) return pending;

  const request = lookup(title)
    .catch(() => null)
    .then((match) => {
      memory.set(trackId, match);
      writeCache();
      return match;
    })
    .finally(() => inFlight.delete(trackId));

  inFlight.set(trackId, request);
  return request;
}
