const https = require("https");

// Pure JavaScript DES Decryption (ECB Mode)
// Self-contained, zero dependencies, works across all Node.js versions
const IP = [58,50,42,34,26,18,10,2,60,52,44,36,28,20,12,4,62,54,46,38,30,22,14,6,64,56,48,40,32,24,16,8,57,49,41,33,25,17,9,1,59,51,43,35,27,19,11,3,61,53,45,37,29,21,13,5,63,55,47,39,31,23,15,7];
const FP = [40,8,48,16,56,24,64,32,39,7,47,15,55,23,63,31,38,6,46,14,54,22,62,30,37,5,45,13,53,21,61,29,36,4,44,12,52,20,60,28,35,3,43,11,51,19,59,27,34,2,42,10,50,18,58,26,33,1,41,9,49,17,57,25];
const E = [32,1,2,3,4,5,4,5,6,7,8,9,8,9,10,11,12,13,12,13,14,15,16,17,16,17,18,19,20,21,20,21,22,23,24,25,24,25,26,27,28,29,28,29,30,31,32,1];
const P = [16,7,20,21,29,12,28,17,1,15,23,26,5,18,31,10,2,8,24,14,32,27,3,9,19,13,30,6,22,11,4,25];
const S = [
  [14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7,0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8,4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0,15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13],
  [15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10,3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5,0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15,13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9],
  [10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8,13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1,13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7,1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12],
  [7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15,13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9,10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4,3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14],
  [2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9,14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6,4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14,11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3],
  [12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11,10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8,9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6,4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13],
  [4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1,13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6,1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2,6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12],
  [13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7,1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2,7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8,2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11]
];
const PC1 = [57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4];
const PC2 = [14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32];
const ROTATIONS = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];

function permute(bits, table) {
  const res = [];
  for (let i = 0; i < table.length; i++) res.push(bits[table[i] - 1]);
  return res;
}
function bytesToBits(bytes) {
  const bits = [];
  for (let i = 0; i < bytes.length; i++) {
    for (let j = 7; j >= 0; j--) bits.push((bytes[i] >> j) & 1);
  }
  return bits;
}
function bitsToBytes(bits) {
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    bytes.push(b);
  }
  return Buffer.from(bytes);
}
function generateSubkeys(keyBytes) {
  const keyBits = bytesToBits(keyBytes);
  const pKey = permute(keyBits, PC1);
  let C = pKey.slice(0, 28), D = pKey.slice(28, 56);
  const subkeys = [];
  for (let r = 0; r < 16; r++) {
    const s = ROTATIONS[r];
    C = C.slice(s).concat(C.slice(0, s));
    D = D.slice(s).concat(D.slice(0, s));
    subkeys.push(permute(C.concat(D), PC2));
  }
  return subkeys;
}
function feistel(R, K) {
  const ER = permute(R, E);
  const xor = ER.map((bit, idx) => bit ^ K[idx]);
  const sOut = [];
  for (let i = 0; i < 8; i++) {
    const block = xor.slice(i * 6, (i + 1) * 6);
    const row = (block[0] << 1) | block[5];
    const col = (block[1] << 3) | (block[2] << 2) | (block[3] << 1) | block[4];
    const val = S[i][row * 16 + col];
    for (let j = 3; j >= 0; j--) sOut.push((val >> j) & 1);
  }
  return permute(sOut, P);
}
function decryptBlock(blockBits, subkeys) {
  const p = permute(blockBits, IP);
  let L = p.slice(0, 32), R = p.slice(32, 64);
  for (let r = 15; r >= 0; r--) {
    const fRes = feistel(R, subkeys[r]);
    const nextL = R;
    const nextR = L.map((bit, idx) => bit ^ fRes[idx]);
    L = nextL; R = nextR;
  }
  return permute(R.concat(L), FP);
}
function desDecryptEcb(encryptedBase64, keyStr = "38346591") {
  const keyBytes = Buffer.from(keyStr, "utf8");
  const subkeys = generateSubkeys(keyBytes);
  const encBuf = Buffer.from(encryptedBase64, "base64");
  const decBytes = [];
  for (let off = 0; off < encBuf.length; off += 8) {
    const block = encBuf.slice(off, off + 8);
    const bits = decryptBlock(bytesToBits(block), subkeys);
    const bBuf = bitsToBytes(bits);
    for (let b of bBuf) decBytes.push(b);
  }
  const buf = Buffer.from(decBytes);
  const pad = buf[buf.length - 1];
  let unpadded = buf;
  if (pad >= 1 && pad <= 8) {
    let isPad = true;
    for (let i = buf.length - pad; i < buf.length; i++) {
      if (buf[i] !== pad) { isPad = false; break; }
    }
    if (isPad) unpadded = buf.slice(0, buf.length - pad);
  }
  return unpadded.toString("utf8").trim();
}

function unescapeHtml(str = "") {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 5000 }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    }).on("error", () => resolve(null));
  });
}

function tokenize(text = "") {
  return text.toLowerCase().replace(/[^a-z0-9]/g, " ").split(/\s+/).filter(w => w.length >= 3);
}

class SaavnStreamer {
  /**
   * Attempts to resolve the exact studio master audio stream from JioSaavn.
   * Returns null if no authentic match is found.
   * @param {string} query
   * @param {Object} [target={}]
   * @returns {Promise<{title: string, author: string, streamUrl: string, duration: number}|null>}
   */
  static async resolveStream(query, target = {}) {
    if (!query) return null;
    const candidates = [query];
    if (target.originalQuery && target.originalQuery !== query) {
      candidates.push(target.originalQuery);
    }
    if (target.title) {
      const stripped = target.title.split(/[|/•—]/)[0].trim();
      if (!candidates.includes(stripped)) candidates.push(stripped);
      if (target.author) {
        const withArtist = `${stripped} ${target.author}`.trim();
        if (!candidates.includes(withArtist)) candidates.push(withArtist);
      }
    }

    const queryTokens = new Set([
      ...tokenize(query),
      ...tokenize(target.originalQuery || ""),
      ...tokenize(target.title || "")
    ]);

    for (const q of candidates) {
      if (!q || q.startsWith("http")) continue;
      const cleanQ = q.replace(/[^a-zA-Z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
      if (!cleanQ) continue;

      const searchUrl = `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(cleanQ)}`;
      const data = await fetchJson(searchUrl);
      const songs = data?.songs?.data;
      if (!Array.isArray(songs) || songs.length === 0) continue;

      for (const song of songs.slice(0, 4)) {
        const songId = song.id;
        if (!songId) continue;

        const candidateTitle = unescapeHtml(song.title || "");
        const candidateArtist = unescapeHtml(song.more_info?.primary_artists || song.description || "");
        const songTokens = [...tokenize(candidateTitle), ...tokenize(candidateArtist)];

        // Validate relevance: ensure at least one significant keyword matches
        let hasOverlap = false;
        for (const token of songTokens) {
          if (queryTokens.has(token)) {
            hasOverlap = true;
            break;
          }
        }
        if (!hasOverlap && queryTokens.size > 0) continue;

        const detailsUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&pids=${songId}&_format=json&_marker=0`;
        const details = await fetchJson(detailsUrl);
        const songData = details?.[songId];
        if (!songData || !songData.encrypted_media_url) continue;

        const rawUrl = desDecryptEcb(songData.encrypted_media_url);
        if (!rawUrl || !rawUrl.startsWith("http")) continue;

        const streamUrl = rawUrl.replace(/_96\.mp4/, "_320.mp4").replace(/_160\.mp4/, "_320.mp4");
        return {
          title: unescapeHtml(songData.song || song.title),
          author: unescapeHtml(songData.primary_artists || song.more_info?.primary_artists || "Artist"),
          streamUrl,
          duration: (Number(songData.duration) || 180) * 1000
        };
      }
    }
    return null;
  }
}

module.exports = SaavnStreamer;
