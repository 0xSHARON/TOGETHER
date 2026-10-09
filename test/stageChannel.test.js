const test = require("node:test");
const assert = require("node:assert/strict");
const { ChannelType, PermissionsBitField } = require("discord.js");
const NativePlayer = require("../src/structures/NativePlayer");

test("handleStageChannel unsuppresses bot and creates stage instance if missing", async () => {
  let createdTopic = null;
  let unsuppressed = false;
  let requestedToSpeak = false;

  const mockChannel = {
    type: ChannelType.GuildStageVoice,
    stageInstance: null,
    guild: {
      members: {
        me: {
          voice: {
            setSuppressed: async (val) => {
              unsuppressed = !val;
            },
            setRequestToSpeak: async (val) => {
              requestedToSpeak = val;
            },
          },
        },
      },
    },
    createStageInstance: async (options) => {
      createdTopic = options.topic;
      return { topic: options.topic };
    },
  };

  const dummyPlayer = Object.create(NativePlayer.prototype);
  await dummyPlayer.handleStageChannel(mockChannel);

  assert.equal(createdTopic, "TOGETHER • Music");
  assert.equal(unsuppressed, true);
  assert.equal(requestedToSpeak, false);
});

test("handleStageChannel falls back to setRequestToSpeak if setSuppressed throws", async () => {
  let requestedToSpeak = false;

  const mockChannel = {
    type: ChannelType.GuildStageVoice,
    stageInstance: { topic: "Existing Stage" },
    guild: {
      members: {
        me: {
          voice: {
            setSuppressed: async () => {
              throw new Error("Missing MuteMembers permission");
            },
            setRequestToSpeak: async (val) => {
              requestedToSpeak = val;
            },
          },
        },
      },
    },
    createStageInstance: async () => {},
  };

  const dummyPlayer = Object.create(NativePlayer.prototype);
  await dummyPlayer.handleStageChannel(mockChannel);

  assert.equal(requestedToSpeak, true);
});

test("join command allows Stage channel when bot has Connect without Speak", async () => {
  const joinCommand = require("../src/commands/Music/join");
  let createdPlayer = false;

  const mockStageChannel = {
    id: "stage_channel_123",
    type: ChannelType.GuildStageVoice,
    permissionsFor: () => ({
      has: (perms) => {
        // Has Connect, lacks Speak
        return perms.length === 1 && perms[0] === PermissionsBitField.Flags.Connect;
      },
    }),
  };

  const mockMessage = {
    guild: {
      id: "guild_123",
      members: { me: { permissions: new PermissionsBitField() } },
    },
    channel: { id: "text_channel_123" },
    member: {
      voice: { channel: mockStageChannel },
    },
    reply: async () => {},
    channel: { send: async () => {} },
  };

  const mockClient = {
    manager: {
      players: new Map(),
      createPlayer: async () => {
        createdPlayer = true;
      },
    },
    emoji: { warn: "⚠️", check: "✅" },
  };

  await joinCommand.execute(mockMessage, [], mockClient, ".");
  assert.equal(createdPlayer, true);
});

test("play command allows Stage channel when bot has Connect without Speak", async () => {
  const playCommand = require("../src/commands/Music/play");

  const mockStageChannel = {
    id: "stage_channel_123",
    type: ChannelType.GuildStageVoice,
    permissionsFor: () => ({
      has: (perms) => {
        // Has Connect, lacks Speak
        return perms.length === 1 && perms[0] === PermissionsBitField.Flags.Connect;
      },
    }),
  };

  let replySent = null;
  const mockMessage = {
    author: { id: "user_123" },
    guild: {
      id: "guild_123",
      members: { me: { permissions: new PermissionsBitField() } },
    },
    channel: {
      id: "text_channel_123",
      send: async (payload) => {
        replySent = payload;
      },
    },
    member: {
      voice: { channel: mockStageChannel },
    },
    reply: async (payload) => {
      replySent = payload;
    },
  };

  const mockClient = {
    emoji: { warn: "⚠️", cross: "❌", check: "✅" },
  };

  // Test permission check path directly
  await playCommand.execute(mockMessage, [], mockClient, ".");
  
  if (replySent) {
    const text = JSON.stringify(replySent);
    assert.equal(text.includes("Please give me `CONNECT` and `SPEAK`"), false);
  }
});
