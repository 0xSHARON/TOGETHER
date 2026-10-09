const VARIANT_SOURCE = "\\b(?:official|audio|video|lyrics?|lyric video|hd|4k|remaster(?:ed)?|mv|visuali[sz]er|live|cover|karaoke|instrumental|slowed|reverb|sped up|nightcore|edit|version)\\b";
const VARIANT_WORDS = new RegExp(VARIANT_SOURCE, "gi");
const HAS_VARIANT_WORD = new RegExp(VARIANT_SOURCE, "i");

function normalizeTrackText(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/\s*-\s*topic\s*$/i, "")
    .replace(/[([].*?[)\]]/g, (part) => HAS_VARIANT_WORD.test(part) ? " " : part)
    .replace(VARIANT_WORDS, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function youtubeId(uri) {
  return String(uri || "").match(/(?:v=|\/vi?\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] || null;
}

function spotifyId(uri) {
  return String(uri || "").match(/track\/([a-zA-Z0-9]+)/)?.[1] || null;
}

function trackKeys(track) {
  if (!track) return [];
  const title = normalizeTrackText(track.title);
  const author = normalizeTrackText(track.author);
  const keys = [
    track.identifier ? `id:${track.identifier}` : null,
    youtubeId(track.uri) ? `youtube:${youtubeId(track.uri)}` : null,
    track.uri ? `uri:${track.uri}` : null,
    title ? `title:${title}` : null,
    title && author ? `song:${title}|${author}` : null,
  ];
  return [...new Set(keys.filter(Boolean))];
}

function isSameSong(first, second) {
  if (!first || !second) return false;
  const firstKeys = new Set(trackKeys(first));
  if (trackKeys(second).some((key) => firstKeys.has(key))) return true;
  const firstTitle = normalizeTrackText(first.title);
  const secondTitle = normalizeTrackText(second.title);
  return Boolean(firstTitle && secondTitle && firstTitle === secondTitle);
}

function selectAutoplayCandidate(source, tracks, recentKeys = []) {
  if (!Array.isArray(tracks) || tracks.length === 0) return null;
  const blocked = new Set(recentKeys);

  // 1. Try finding a fresh track not in recent history
  const freshCandidate = tracks.find((track) =>
    track?.title &&
    !isSameSong(source, track) &&
    !trackKeys(track).some((key) => blocked.has(key))
  );

  if (freshCandidate) return freshCandidate;

  // 2. Fallback: pick any track that isn't the exact same track currently playing
  return tracks.find((track) => track?.title && !isSameSong(source, track)) || tracks[0] || null;
}

function buildAutoplaySearches(track) {
  const searches = [];
  const author = normalizeTrackText(track?.author);
  const title = normalizeTrackText(track?.title);

  if (author) {
    searches.push(["ytmsearch", `${author} radio`]);
  }

  const sId = spotifyId(track?.uri) || (track?.sourceName === 'spotify' ? track?.identifier : null);
  if (sId) {
    searches.push(["sprec", `seed_tracks=${sId}`]);
  }

  const yId = youtubeId(track?.uri) || (track?.sourceName === 'youtube' ? track?.identifier : null);
  if (yId) {
    searches.push(["ytmsearch", `https://music.youtube.com/watch?v=${yId}&list=RD${yId}`]);
    searches.push(["ytsearch", `https://www.youtube.com/watch?v=${yId}&list=RD${yId}`]);
  }

  const related = [title, author].filter(Boolean).join(" ");
  const mix = author ? `${author} mix` : `${title} mix`;

  searches.push(
    ["scsearch", related],
    ["spsearch", related],
    ["scsearch", mix],
    ["ytmsearch", related],
    ["dzsearch", related]
  );
  
  return searches.filter(([, query]) => query);
}

function rememberTracks(existing, tracks, limit = 40) {
  const added = tracks.flatMap(trackKeys);
  return [...new Set([...added, ...(existing || [])])].slice(0, limit);
}

module.exports = {
  buildAutoplaySearches,
  isSameSong,
  normalizeTrackText,
  rememberTracks,
  selectAutoplayCandidate,
  trackKeys,
};
