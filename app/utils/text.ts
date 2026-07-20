export function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/**
 * Heuristic check for gibberish / non-language input (e.g. random keyboard
 * mashing like "NBVGFDXZS..."). Humanizing or AI-checking such input is
 * meaningless, so tools reject it up front. A token is "plausible" if it
 * contains a vowel and has no absurdly long consonant run; if too few tokens
 * are plausible, the input is treated as gibberish.
 */
export function looksLikeGibberish(input: string): boolean {
  const tokens = (input.toLowerCase().match(/[a-z]+/g) || []).filter(
    (t) => t.length >= 2,
  );
  // Not enough alphabetic content to judge — let it through.
  if (tokens.length < 3) return false;

  const isPlausible = (t: string) => {
    if (t.length > 18) return false; // real words are rarely this long
    if (!/[aeiou]/.test(t)) return false; // a word with no vowel is unlikely
    if (/[bcdfghjklmnpqrstvwxyz]{5,}/.test(t)) return false; // 5+ consonants in a row
    return true;
  };

  const plausible = tokens.filter(isPlausible).length;
  // Fewer than half the tokens look like real words → gibberish.
  return plausible / tokens.length < 0.5;
}

