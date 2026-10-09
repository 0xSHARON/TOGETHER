const test = require("node:test");
const assert = require("node:assert/strict");
const voteCommand = require("../src/commands/Utility/vote");
const { sendVoteNotification, VOTE_CHANNEL_ID } = require("../src/utils/voteNotifier");

test("vote command metadata is defined correctly", () => {
  assert.equal(voteCommand.name, "vote");
  assert.ok(voteCommand.aliases.includes("voted"));
  assert.ok(voteCommand.aliases.includes("vo"));
  assert.equal(voteCommand.category, "Utility");
  assert.ok(typeof voteCommand.execute === "function");
  assert.ok(typeof voteCommand.slashExecute === "function");
});

test("vote returns 'You haven\\'t voted yet!' when user has not voted", async () => {
  let repliedOptions = null;
  const mockMessage = {
    author: { id: "123456789", username: "TestUser" },
    mentions: { users: new Map() },
    reply: async (options) => {
      repliedOptions = options;
      return options;
    },
  };

  const mockClient = {
    user: { id: "987654321", username: "TogetherBot" },
    emoji: { check: "✅", warn: "⚠️", cross: "❌" },
    config: { links: {}, ownerID: [] },
    votedUsers: new Set(),
  };

  await voteCommand.execute(mockMessage, [], mockClient, ".");

  assert.ok(repliedOptions);
  assert.ok(repliedOptions.components?.length > 0);
  const container = repliedOptions.components[0];
  const serialized = JSON.stringify(container);
  assert.match(serialized, /You haven't voted yet!/);
  assert.match(serialized, /Click the button below to vote on Top\.gg/);
  assert.match(serialized, /https:\/\/top\.gg\/bot\/987654321\/vote/);
});

test("vote returns 'Thank you for voting!' when user has voted", async () => {
  let repliedOptions = null;
  const mockMessage = {
    author: { id: "123456789", username: "TestUser" },
    mentions: { users: new Map() },
    reply: async (options) => {
      repliedOptions = options;
      return options;
    },
  };

  const mockClient = {
    user: { id: "987654321", username: "TogetherBot" },
    emoji: { check: "✅", warn: "⚠️", cross: "❌" },
    config: { links: {}, ownerID: [] },
    votedUsers: new Set(["123456789"]),
  };

  await voteCommand.execute(mockMessage, [], mockClient, ".");

  assert.ok(repliedOptions);
  assert.ok(repliedOptions.components?.length > 0);
  const container = repliedOptions.components[0];
  const serialized = JSON.stringify(container);
  assert.match(serialized, /Thank you for voting!/);
  assert.match(serialized, /Your support keeps the music playing/);
});

test("sendVoteNotification sends vote announcement to channel 1524235256339890327", async () => {
  assert.equal(VOTE_CHANNEL_ID, "1524235256339890327");

  let sentPayload = null;
  const mockChannel = {
    id: "1524235256339890327",
    name: "vote-logs",
    send: async (payload) => {
      sentPayload = payload;
      return { id: "msg_123", ...payload };
    },
  };

  const mockClient = {
    user: { id: "987654321", username: "TogetherBot" },
    emoji: { check: "✅", warn: "⚠️", sparkles: "✨" },
    config: { voteChannelId: "1524235256339890327", links: {} },
    channels: {
      cache: new Map([["1524235256339890327", mockChannel]]),
      fetch: async (id) => (id === "1524235256339890327" ? mockChannel : null),
    },
    users: {
      cache: new Map([["123456789", { id: "123456789", username: "VoterUser" }]]),
      fetch: async (id) => ({ id, username: "VoterUser" }),
    },
    logger: { log: () => {} },
  };

  const result = await sendVoteNotification(mockClient, "123456789");
  assert.ok(result);
  assert.ok(sentPayload);
  const serialized = JSON.stringify(sentPayload);
  assert.match(serialized, /123456789/);
  assert.match(serialized, /Thank you for voting! Your support keeps the music playing/);
  assert.match(serialized, /Top\.gg/);
});
