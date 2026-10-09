const test = require("node:test");
const assert = require("node:assert/strict");
const { isBotOwner, checkVoterAccess, buildVoterLockPayload } = require("../src/utils/voterCheck");
const autoplayCommand = require("../src/commands/Music/autoplay");
const lyricsCommand = require("../src/commands/Music/lyrics");
const twoFourSevenCommand = require("../src/commands/Config/247");

test("isBotOwner recognizes configured owners and env owners", () => {
  const client = {
    config: { ownerID: ["owner_123"] },
    owners: ["owner_456"],
  };

  assert.equal(isBotOwner(client, "owner_123"), true);
  assert.equal(isBotOwner(client, "owner_456"), true);
  assert.equal(isBotOwner(client, "regular_user"), false);
  assert.equal(isBotOwner(client, null), false);
});

test("checkVoterAccess allows bot owners to bypass without voting", async () => {
  const client = {
    config: { ownerID: ["owner_999"] },
    votedUsers: new Set(),
  };

  const result = await checkVoterAccess(client, "owner_999");
  assert.deepEqual(result, { allowed: true, isOwner: true, isVoter: true });
});

test("checkVoterAccess blocks non-voters who are not owners", async () => {
  const client = {
    config: { ownerID: ["owner_999"] },
    votedUsers: new Set(),
  };

  const result = await checkVoterAccess(client, "random_user_555");
  assert.deepEqual(result, { allowed: false, isOwner: false, isVoter: false });
});

test("checkVoterAccess allows users who are in votedUsers set", async () => {
  const client = {
    config: { ownerID: [] },
    votedUsers: new Set(["voter_777"]),
  };

  const result = await checkVoterAccess(client, "voter_777");
  assert.deepEqual(result, { allowed: true, isOwner: false, isVoter: true });
});

test("buildVoterLockPayload returns Components V2 structure with Top.gg link", () => {
  const client = {
    user: { id: "bot_123", username: "Together" },
    emoji: { warn: "⚠️", sparkles: "✨" },
    config: { links: { vote: "https://top.gg/bot/bot_123/vote" } },
  };

  const payload = buildVoterLockPayload(client, "Autoplay Mode");
  assert.ok(payload.components?.length > 0);
  const serialized = JSON.stringify(payload);
  assert.match(serialized, /Top\.gg Voter Feature/);
  assert.match(serialized, /Autoplay Mode/);
  assert.match(serialized, /https:\/\/top\.gg\/bot\/bot_123\/vote/);
});

test("autoplay blocks non-voter and allows bot owner bypass", async () => {
  let repliedNonVoter = null;
  const nonVoterMessage = {
    author: { id: "non_voter_1" },
    guild: { id: "guild_1" },
    reply: async (opt) => {
      repliedNonVoter = opt;
      return opt;
    },
  };

  const mockClient = {
    user: { id: "bot_123", username: "Together" },
    config: { ownerID: ["owner_vip"] },
    votedUsers: new Set(),
    manager: {
      players: new Map([
        [
          "guild_1",
          {
            data: new Map([["autoplay", false]]),
          },
        ],
      ]),
    },
    emoji: { check: "✅", warn: "⚠️", sparkles: "✨" },
  };

  await autoplayCommand.execute(nonVoterMessage, [], mockClient, ".");
  assert.ok(repliedNonVoter);
  assert.match(JSON.stringify(repliedNonVoter), /Top\.gg Voter Feature/);

  // Owner bypass
  let repliedOwner = null;
  const ownerMessage = {
    author: { id: "owner_vip" },
    guild: { id: "guild_1" },
    reply: async (opt) => {
      repliedOwner = opt;
      return opt;
    },
  };

  await autoplayCommand.execute(ownerMessage, [], mockClient, ".");
  assert.ok(repliedOwner);
  assert.match(JSON.stringify(repliedOwner), /Autoplay has been `Enabled`/);
});

test("lyrics blocks non-voter and allows voter", async () => {
  let repliedNonVoter = null;
  const nonVoterMessage = {
    author: { id: "non_voter_2" },
    guild: { id: "guild_1" },
    reply: async (opt) => {
      repliedNonVoter = opt;
      return opt;
    },
  };

  const mockClient = {
    user: { id: "bot_123", username: "Together" },
    config: { ownerID: [] },
    votedUsers: new Set(["voter_pass"]),
    manager: {
      players: new Map([
        [
          "guild_1",
          {
            queue: { current: null },
          },
        ],
      ]),
    },
    emoji: { check: "✅", cross: "❌", warn: "⚠️", sparkles: "✨" },
  };

  await lyricsCommand.execute(nonVoterMessage, [], mockClient, ".");
  assert.ok(repliedNonVoter);
  assert.match(JSON.stringify(repliedNonVoter), /Top\.gg Voter Feature/);

  // Voter allowed
  let repliedVoter = null;
  const voterMessage = {
    author: { id: "voter_pass" },
    guild: { id: "guild_1" },
    reply: async (opt) => {
      repliedVoter = opt;
      return opt;
    },
  };

  await lyricsCommand.execute(voterMessage, [], mockClient, ".");
  assert.ok(repliedVoter);
  assert.match(JSON.stringify(repliedVoter), /No song is currently playing/);
});

test("247 blocks non-voter and allows bot owner", async () => {
  let repliedNonVoter = null;
  const nonVoterMessage = {
    author: { id: "non_voter_3" },
    guild: { id: "guild_1" },
    member: { voice: { channel: null } },
    reply: async (opt) => {
      repliedNonVoter = opt;
      return opt;
    },
  };

  const mockClient = {
    user: { id: "bot_123", username: "Together" },
    config: { ownerID: ["owner_admin"] },
    votedUsers: new Set(),
    manager: { players: new Map() },
    emoji: { check: "✅", warn: "⚠️", sparkles: "✨" },
  };

  await twoFourSevenCommand.execute(nonVoterMessage, [], mockClient, ".");
  assert.ok(repliedNonVoter);
  assert.match(JSON.stringify(repliedNonVoter), /Top\.gg Voter Feature/);

  // Owner passes voter check, reaches voice channel requirement check
  let repliedOwner = null;
  const ownerMessage = {
    author: { id: "owner_admin" },
    guild: { id: "guild_1" },
    member: { voice: { channel: null } },
    reply: async (opt) => {
      repliedOwner = opt;
      return opt;
    },
  };

  await twoFourSevenCommand.execute(ownerMessage, [], mockClient, ".");
  assert.ok(repliedOwner);
  assert.match(JSON.stringify(repliedOwner), /Not in Voice Channel/);
});
