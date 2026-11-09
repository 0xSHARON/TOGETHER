const test = require("node:test");
const assert = require("node:assert/strict");
const { loadImage } = require("@napi-rs/canvas");
const { renderProfileCanvas } = require("../src/utils/profileCanvas");

test("profile canvas renders 1200x675 image with emoji and text properly", async () => {
  const buffer = await renderProfileCanvas({
    user: { displayName: "Sharon 🎧🔥", username: "sharon" },
    level: 15,
    xp: 4500,
    maxXP: 10000,
    listeningHours: 42,
    songsPlayed: 320,
    streak: 7,
    badges: ["FIRST_SONG", "NIGHT_OWL"],
    bio: "Listening to chill beats 🚀"
  });

  assert.ok(buffer);
  const image = await loadImage(buffer);
  assert.equal(image.width, 1200);
  assert.equal(image.height, 675);
  assert.ok(buffer.length > 10000);
});
