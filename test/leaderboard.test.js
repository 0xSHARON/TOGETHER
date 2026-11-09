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

  // 2. Sort by XP descending
  filtered.sort((a, b) => b.xp - a.xp);
  filtered.forEach((u, i) => { u.rank = i + 1; });

  assert.equal(filtered[0].name, "Alice");
  assert.equal(filtered[0].rank, 1);
  assert.equal(filtered[1].name, "Bob");
  assert.equal(filtered[1].rank, 2);
  assert.equal(filtered[2].name, "Charlie");
  assert.equal(filtered[2].rank, 3);

  // 3. Sort by songs played
  const bySongs = [...filtered].sort((a, b) => b.songsPlayed - a.songsPlayed);
  assert.equal(bySongs[0].name, "Alice");

  // 4. Sort by streak
  const byStreak = [...filtered].sort((a, b) => b.streak - a.streak);
  assert.equal(byStreak[0].name, "Alice");
  assert.equal(byStreak[1].name, "Bob");
});
