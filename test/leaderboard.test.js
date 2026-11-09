const test = require("node:test");
const assert = require("node:assert/strict");

test("Leaderboard bot filtering and ranking logic", () => {
  const botId = "863496211667484676";
  const rawUsers = [
    { userId: "user_1", name: "Alice", songsPlayed: 100, xp: 2000, listeningSeconds: 15000, streak: 5 },
    { userId: botId, name: "TOGETHER", songsPlayed: 31, xp: 465, listeningSeconds: 42371, streak: 1 },
    { userId: "user_2", name: "Bob", songsPlayed: 50, xp: 1200, listeningSeconds: 9000, streak: 2 },
    { userId: "user_3", name: "Charlie", songsPlayed: 10, xp: 300, listeningSeconds: 2000, streak: 0 },
    { userId: "user_bot_other", name: "OtherBot", songsPlayed: 5, xp: 100, listeningSeconds: 1000, streak: 0, isBot: true },
  ];

  // 1. Filter out bot user ID and any bot account
  const filtered = rawUsers.filter((u) => u.userId !== botId && !u.isBot);
  assert.equal(filtered.length, 3, "Both bot accounts should be removed");
  assert.ok(!filtered.some((u) => u.userId === botId), "Bot ID should not exist in filtered list");

  // 2. Sort primarily by listeningSeconds descending (Listen Time)
  filtered.sort((a, b) => b.listeningSeconds - a.listeningSeconds || b.songsPlayed - a.songsPlayed || b.xp - a.xp);
  filtered.forEach((u, i) => { u.rank = i + 1; });

  assert.equal(filtered[0].name, "Alice");
  assert.equal(filtered[0].rank, 1);
  assert.equal(filtered[1].name, "Bob");
  assert.equal(filtered[1].rank, 2);
  assert.equal(filtered[2].name, "Charlie");
  assert.equal(filtered[2].rank, 3);

  // 3. Sort by XP descending
  const byXp = [...filtered].sort((a, b) => b.xp - a.xp);
  assert.equal(byXp[0].name, "Alice");

  // 4. Sort by songs played
  const bySongs = [...filtered].sort((a, b) => b.songsPlayed - a.songsPlayed);
  assert.equal(bySongs[0].name, "Alice");

  // 5. Sort by streak
  const byStreak = [...filtered].sort((a, b) => b.streak - a.streak);
  assert.equal(byStreak[0].name, "Alice");
  assert.equal(byStreak[1].name, "Bob");
});

test("Leaderboard command buttons do not contain normal unicode emojis", () => {
  const fs = require("fs");
  const path = require("path");
  const lbContent = fs.readFileSync(path.join(__dirname, "../src/commands/Information/lb.js"), "utf8");

  // Verify server and global buttons do not contain normal emojis (🏰, 🌐)
  assert.ok(!lbContent.includes("🏰 Server Leaderboard"), "Must not use 🏰 in server leaderboard button");
  assert.ok(!lbContent.includes("🌐 Global Leaderboard"), "Must not use 🌐 in global leaderboard button");
  assert.ok(!lbContent.includes('"◀"'), "Must not fallback to ◀ unicode emoji");
  assert.ok(!lbContent.includes('"▶"'), "Must not fallback to ▶ unicode emoji");
  assert.ok(!lbContent.includes('"🎯"'), "Must not fallback to 🎯 unicode emoji");

  // Verify sort order uses listeningSeconds first
  assert.ok(
    lbContent.includes("listeningSeconds: -1, songsPlayed: -1, xp: -1"),
    "Must sort by listeningSeconds primarily"
  );
});

