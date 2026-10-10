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

test("handleVoteWebhook returns 200 on GET /webhook", async () => {
  const { handleVoteWebhook } = require("../src/utils/voteNotifier");
  const mockClient = { config: {}, logger: { log: () => {} } };

  let statusCode = 0;
  let responseData = "";
  const req = { method: "GET" };
  const res = {
    writeHead: (code) => { statusCode = code; },
    end: (data) => { responseData = data; }
  };

  handleVoteWebhook(mockClient, req, res);
  assert.equal(statusCode, 200);
  const parsed = JSON.parse(responseData);
  assert.equal(parsed.status, "ok");
  assert.equal(parsed.endpoint, "https://together.dpdns.org/webhook");
});

test("handleVoteWebhook registers voter on POST", async () => {
  const { handleVoteWebhook } = require("../src/utils/voteNotifier");
  const { EventEmitter } = require("events");

  const mockClient = {
    votedUsers: new Set(),
    announcedVotes: new Set(),
    user: { id: "987654321", username: "Together" },
    config: {},
    channels: { cache: new Map(), fetch: async () => null },
    users: { cache: new Map(), fetch: async () => null },
    logger: { log: () => {} },
  };

  const req = new EventEmitter();
  req.method = "POST";
  req.headers = {};

  let statusCode = 0;
  let responseData = "";
  const res = {
    writeHead: (code) => { statusCode = code; },
    end: (data) => { responseData = data; }
  };

  const promise = new Promise((resolve) => {
    res.end = (data) => {
      responseData = data;
      resolve();
    };
  });

  handleVoteWebhook(mockClient, req, res);

  req.emit("data", Buffer.from(JSON.stringify({ user: "780345293237125152", isWeekend: true, type: "upvote" })));
  req.emit("end");

  await promise;
  assert.equal(statusCode, 200);
  assert.ok(mockClient.votedUsers.has("780345293237125152"));
  assert.ok(mockClient.announcedVotes.has("780345293237125152"));
});
