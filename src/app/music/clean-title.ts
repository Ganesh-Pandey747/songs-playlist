/**
 * YouTube music-video titles carry a lot of upload furniture
 * ("Song Name Full Video Song | Movie | Singers - 90's Hits"). This trims them
 * down to something that fits a player bar.
 *
 * It runs on both the snapshot in `playlists.ts` and on live titles reported by
 * the IFrame player, so a video added to the playlist later reads the same way.
 */

const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2764}]/gu;

/** Words that describe the upload rather than the song. */
const FURNITURE =
  /\b(full\s+(video|audio)\s+songs?|full\s+songs?|video\s+songs?|audio\s+songs?|lyrical\s+video|lyrics?|lyrical|full\s+video|4k\s*video|male\s+version|female\s+version|official|full|songs?|hd|4k)\b/gi;

/** If a trailing " - …" clause contains one of these, it's a tag list, not part of the name. */
const TAG_WORDS =
  /\b(songs?|hits?|romantic|sad|lyrical|lyrics?|video|audio|best|album|movie|version|80'?s|90'?s|2000'?s)\b/i;

export function cleanTitle(raw: string): string {
  const head = raw.split(/[|[]/)[0];

  let text = head
    .replace(EMOJI, '')
    .replace(/^\s*lyrical\s*:\s*/i, '')
    .replace(FURNITURE, '')
    .replace(/\*+/g, '')
    .replace(/\(\s*\)/g, ' ')
    // Removing an interior clause ("A - Male Version - B") leaves a double dash.
    .replace(/(\s*[-–—]\s*){2,}/g, ' - ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Drop trailing "- Kumar Sanu Songs - Romantic - 90's Love" style tag lists.
  const clauses = text.split(/\s+[-–—]\s+/);
  if (clauses.length > 1 && TAG_WORDS.test(clauses.slice(1).join(' '))) {
    text = clauses[0];
  }

  text = text.replace(/\s*[-–—,:]\s*$/, '').trim();
  return text.length >= 3 ? text : head.trim();
}
