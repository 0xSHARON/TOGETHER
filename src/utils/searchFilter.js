/**
 * Utility functions for cleaning search queries and filtering match results
 */

function calculateSimilarity(a, b) {
  if (!a || !b) return 0;
  const strA = a.toLowerCase().trim();
  const strB = b.toLowerCase().trim();
  if (strA === strB) return 1.0;
  if (!strA.length || !strB.length) return 0;

  const longer = strA.length > strB.length ? strA : strB;
  const shorter = strA.length > strB.length ? strB : strA;

  let edits = longer.length - shorter.length;
  const matrix = Array(shorter.length + 1).fill(null).map(() => []);

  for (let i = 0; i <= shorter.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= longer.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= shorter.length; i++) {
    for (let j = 1; j <= longer.length; j++) {
      const cost = shorter[i - 1] === longer[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return (longer.length - matrix[shorter.length][longer.length]) / longer.length;
}

function cleanQuery(query) {
  if (!query || typeof query !== "string") return "";
  return query
    .replace(/\(.*?\)/g, '')               // (Official Video), (Lyrics), (Audio)
    .replace(/\[.*?\]/g, '')               // [4K], [Official Music Video]
    .replace(/ - Topic/gi, '')             // YouTube auto-generated artist topic channels
    .replace(/\b(official\s*(music)?\s*video|official\s*audio|lyric\s*video|full\s*song|hd|4k)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function filterCandidates(tracks, query, minSimilarity = 0.4) {
  if (!Array.isArray(tracks) || tracks.length === 0) return [];
  const cleaned = cleanQuery(query).toLowerCase();

  return tracks.filter(track => {
    const title = (track.title || track.info?.title || "").toLowerCase();
    const author = (track.author || track.info?.author || "").toLowerCase();
    const full = `${title} ${author}`;

    // If query words are present or similarity is high
    const sim = Math.max(
      calculateSimilarity(title, cleaned),
      calculateSimilarity(full, cleaned)
    );

    return sim >= minSimilarity || title.includes(cleaned) || cleaned.includes(title);
  });
}

module.exports = {
  calculateSimilarity,
  cleanQuery,
  filterCandidates
};
