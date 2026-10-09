const test = require("node:test");
const assert = require("node:assert/strict");
const serverlistCommand = require("../src/commands/Owner/serverlist");

test("serverlist command metadata is defined correctly", () => {
  assert.equal(serverlistCommand.name, "serverlist");
  assert.equal(serverlistCommand.category, "Owner");
  assert.equal(serverlistCommand.owner, true);
  assert.ok(serverlistCommand.aliases.includes("sl"));
  assert.ok(serverlistCommand.aliases.includes("servers"));
  assert.ok(serverlistCommand.aliases.includes("serverinvite"));
});

test("serverlist ignores non-owner execute calls", async () => {
  let replied = false;
  const mockMessage = {
    author: { id: "not_an_owner" },
    reply: async () => { replied = true; },
  };
  const mockClient = {
    config: { ownerID: ["owner_123"] },
    guilds: { cache: new Map() },
  };

  await serverlistCommand.execute(mockMessage, [], mockClient, ".");
  assert.equal(replied, false);
});

test("serverlist query by guild ID returns direct invite link card", async () => {
  let repliedPayload = null;
  const mockGuild = {
    id: "guild_888",
    name: "VIP Lounge",
    memberCount: 500,
    ownerId: "owner_vip",
    vanityURLCode: "viplounge",
  };

  const mockMessage = {
    author: { id: "owner_123" },
    reply: async (payload) => {
      repliedPayload = payload;
      return payload;
    },
  };

  const mockClient = {
    config: { ownerID: ["owner_123"] },
    guilds: {
      cache: new Map([["guild_888", mockGuild]]),
    },
    emoji: { check: "✅", warn: "⚠️" },
  };

  await serverlistCommand.execute(mockMessage, ["guild_888"], mockClient, ".");
  assert.ok(repliedPayload);
  const serialized = JSON.stringify(repliedPayload);
  assert.match(serialized, /VIP Lounge/);
  assert.match(serialized, /https:\/\/discord\.gg\/viplounge/);
  assert.match(serialized, /guild_888/);
});

test("serverlist creates channel invite when no vanity URL exists", async () => {
  let repliedPayload = null;
  const mockChannel = {
    isTextBased: () => true,
    permissionsFor: () => ({ has: () => true }),
    createInvite: async () => ({ url: "https://discord.gg/custom-invite-123" }),
  };

  const mockGuild = {
    id: "guild_999",
    name: "Rock Music Hub",
    memberCount: 150,
    ownerId: "hub_owner",
    vanityURLCode: null,
    invites: { fetch: async () => new Map() },
    systemChannel: null,
    members: {
      me: { id: "bot_123" },
      fetchMe: async () => ({ id: "bot_123" }),
    },
    channels: {
      cache: new Map([["chan_1", mockChannel]]),
    },
  };

  const mockMessage = {
    author: { id: "owner_123" },
    reply: async (payload) => {
      repliedPayload = payload;
      return payload;
    },
  };

  const mockClient = {
    config: { ownerID: ["owner_123"] },
    guilds: {
      cache: new Map([["guild_999", mockGuild]]),
    },
    emoji: { check: "✅", warn: "⚠️" },
  };

  await serverlistCommand.execute(mockMessage, ["Rock Music Hub"], mockClient, ".");
  assert.ok(repliedPayload);
  const serialized = JSON.stringify(repliedPayload);
  assert.match(serialized, /Rock Music Hub/);
  assert.match(serialized, /https:\/\/discord\.gg\/custom-invite-123/);
});
