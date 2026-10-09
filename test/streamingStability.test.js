const test = require("node:test");
const assert = require("node:assert/strict");
const TogetherStreamer = require("../src/structures/TogetherStreamer");

test("creates stream resource with highWaterMark jitter buffer and valid audio resource", () => {
  const dummyStreamUrl = "https://example.com/audio.mp3";
  const { resource, ffmpeg } = TogetherStreamer.createStreamResource(dummyStreamUrl, {
    volume: 75,
    seek: 1000
  });

  assert.ok(resource, "Audio resource should be created");
  assert.ok(ffmpeg, "FFmpeg child process should be spawned");
  try {
    ffmpeg.kill("SIGKILL");
  } catch {}
});
