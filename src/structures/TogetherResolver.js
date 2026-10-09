const { spawn } = require("child_process");
const spotifyUrlInfo = require("spotify-url-info");
const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));
const play = require("play-dl");
const { getYtDlpRunner } = require("../utils/systemBinary");

const spotify = spotifyUrlInfo(fetch);

class TogetherTrack {
  constructor(data) {
    this.title = data.title || "Unknown Title";
    this.author = data.author || data.artist || "Unknown Artist";
    this.length = Number(data.length || data.duration || 0);
    this.duration = this.length;
    this.uri = data.uri || data.link || "https://spotify.com";
    this.thumbnail = data.thumbnail || data.image || "https://i.scdn.co/image/ab67616d0000b273baf89eb11ec7c657805d2da0";
    this.artworkUrl = this.thumbnail;
    this.identifier = data.identifier || data.id || Math.random().toString(36).substring(7);
    this.isSeekable = true;
    this.isStream = Boolean(data.isStream);
    this.requester = data.requester || null;
    this.sourceName = data.sourceName || "together";
    this.searchQuery = data.searchQuery || `${this.title} - ${this.author}`;
  }
}

class TogetherResolver {
  static isSpotifyUrl(query) {
    return /^(https?:\/\/)?(open\.)?spotify\.com\/(track|album|playlist)\/[a-zA-Z0-9]+/.test(query) ||
           /^spotify:(track|album|playlist):[a-zA-Z0-9]+/.test(query);
  }

  static isYouTubeUrl(query) {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(query);
  }

  static async searchPlayDl(query, limit = 5, requester = null) {
    try {
      const results = await play.search(query, {
        limit,
        source: { youtube: "video" }
      });
      if (Array.isArray(results) && results.length > 0) {
        return results.map(item => new TogetherTrack({
          title: item.title || "Unknown Title",
          author: item.channel?.name || "YouTube Artist",
          length: (item.durationInSec || 180) * 1000,
          uri: item.url || query,
          thumbnail: item.thumbnails?.[0]?.url,
          sourceName: "youtube",
          searchQuery: item.url || query,
          requester
        }));
      }
    } catch {}
    return [];
  }

  static searchYtDlp(query, limit = 5) {
    return new Promise((resolve) => {
      const runner = getYtDlpRunner();
      const args = [
        ...runner.argsPrefix,
        "--no-update",
        "--no-warnings",
        "--flat-playlist",
        "-j",
        `ytsearch${limit}:${query}`
      ];

      const proc = spawn(runner.cmd, args);
      let stdout = "";
      proc.stdout.on("data", d => stdout += d.toString());
      proc.on("error", () => resolve([]));
      proc.on("close", (code) => {
        if (code !== 0 || !stdout.trim()) return resolve([]);
        const lines = stdout.trim().split("\n");
        const results = [];
        for (const line of lines) {
          try {
            const data = JSON.parse(line.trim());
            results.push(data);
          } catch {}
        }
        resolve(results);
      });
    });
  }

  static _attachRequester(result, requester) {
    if (result && Array.isArray(result.tracks) && requester) {
      for (const track of result.tracks) {
        if (!track.requester) track.requester = requester;
      }
    }
    return result;
  }

  static async resolve(query, options = {}) {
    const requester = options.requester || null;
    const result = await this._resolveRaw(query, options, requester);
    return this._attachRequester(result, requester);
  }

  static async _resolveRaw(query, options = {}, requester = null) {
    // 1. Spotify Resolution (Track, Album, Playlist)
    if (this.isSpotifyUrl(query)) {
      try {
        if (query.includes("/track/") || query.startsWith("spotify:track:")) {
          const preview = await spotify.getPreview(query);
          if (preview && preview.title) {
            const track = new TogetherTrack({
              title: preview.title,
              author: preview.artist || "Unknown Artist",
              length: preview.duration || 180000,
              uri: preview.link || query,
              thumbnail: preview.image,
              requester,
              sourceName: "spotify",
              searchQuery: `${preview.title} ${preview.artist || ""}`.trim()
            });
            return { type: "TRACK", tracks: [track] };
          }
        } else if (query.includes("/playlist/") || query.includes("/album/") ||
                   query.startsWith("spotify:playlist:") || query.startsWith("spotify:album:")) {
          const rawTracks = await spotify.getTracks(query);
          if (Array.isArray(rawTracks) && rawTracks.length > 0) {
            const tracks = rawTracks.map((t, idx) => new TogetherTrack({
              title: t.name || t.title || `Track ${idx + 1}`,
              author: t.artist || (t.artists ? t.artists.map(a => a.name).join(", ") : "Unknown Artist"),
              length: Number(t.duration || t.duration_ms || 180000),
              uri: t.link || query,
              thumbnail: t.image || t.coverArt?.sources?.[0]?.url,
              requester,
              sourceName: "spotify",
              searchQuery: `${t.name || t.title} ${t.artist || ""}`.trim()
            }));
            const isAlbum = query.includes("/album/") || query.startsWith("spotify:album:");
            return {
              type: "PLAYLIST",
              playlistName: isAlbum ? (rawTracks[0]?.album || "Spotify Album") : "Spotify Playlist",
              tracks
            };
          }
        }
      } catch (err) {
        console.warn(`[TogetherResolver] Spotify scrape failed, using iTunes fallback:`, err.message);
      }
    }

    // 2. YouTube URL Resolution
    if (this.isYouTubeUrl(query)) {
      try {
        const encodedUrl = encodeURIComponent(query);
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodedUrl}&format=json`);
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          const track = new TogetherTrack({
            title: oembedData.title || "YouTube Video",
            author: oembedData.author_name || "YouTube Creator",
            length: 200000,
            uri: query,
            thumbnail: oembedData.thumbnail_url,
            requester,
            sourceName: "youtube",
            searchQuery: query
          });
          return { type: "TRACK", tracks: [track] };
        }
      } catch (e) {
        console.warn("[TogetherResolver] YouTube oEmbed fallback:", e.message);
      }
    }

    // 3. Instant Native Async Search via play-dl (<300ms)
    try {
      const playDlResults = await this.searchPlayDl(query, 5, requester);
      if (playDlResults && playDlResults.length > 0) {
        return { type: "SEARCH", tracks: playDlResults };
      }
    } catch {}

    // 4. Reliable yt-dlp Fallback Search
    try {
      const ytdlResults = await this.searchYtDlp(query, 5);
      if (ytdlResults.length > 0) {
        const tracks = ytdlResults.map(item => new TogetherTrack({
          title: item.title || "Unknown Title",
          author: item.channel || item.uploader || "YouTube Artist",
          length: Math.round((item.duration || 180) * 1000),
          uri: item.url || item.webpage_url || query,
          thumbnail: item.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
          requester,
          sourceName: "youtube",
          searchQuery: item.url || item.webpage_url || query
        }));
        return { type: "SEARCH", tracks };
      }
    } catch (err) {
      console.warn(`[TogetherResolver] yt-dlp search error: ${err.message}`);
    }

    // 4. iTunes Search Fallback (High quality metadata without keys)
    try {
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`;
      const itunesRes = await fetch(itunesUrl);
      if (itunesRes.ok) {
        const itunesData = await itunesRes.json();
        if (itunesData.results && itunesData.results.length > 0) {
          const tracks = itunesData.results.map(item => new TogetherTrack({
            title: item.trackName,
            author: item.artistName,
            length: Number(item.trackTimeMillis || 180000),
            uri: item.trackViewUrl,
            thumbnail: item.artworkUrl100 ? item.artworkUrl100.replace("100x100bb.jpg", "600x600bb.jpg") : null,
            requester,
            sourceName: "itunes",
            searchQuery: `${item.trackName} ${item.artistName}`
          }));
          return { type: "SEARCH", tracks };
        }
      }
    } catch (err) {
      console.error(`[TogetherResolver] iTunes search error:`, err.message);
    }

    return { type: "SEARCH", tracks: [] };
  }
}

module.exports = { TogetherResolver, TogetherTrack };
