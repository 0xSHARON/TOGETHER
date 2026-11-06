const { EmbedBuilder } = require("discord.js");
const config = require("../config");

const THREAD_NAMES = {
  console: "💻・console-logs",
  cmdrun: "📜・commands-log",
  tickets: "📩・ticket-logs",
  suggestions: "💡・suggestions-log",
  bugreports: "🐛・bugreports-log",
  welcome: "👋・welcome-logs",
  error: "⚠️・system-errors",
  default: "📋・general-logs"
};

const THREAD_DESCRIPTIONS = {
  console: {
    title: "Live Terminal & Console Stream",
    desc: "Mirrors real-time helper bot terminal stdout/stderr logs, startup telemetry, and gateway events in colorized ANSI."
  },
  cmdrun: {
    title: "Command Execution Log",
    desc: "Records every Slash and Prefix command executed by server members with executor and argument details."
  },
  tickets: {
    title: "Support Tickets Log",
    desc: "Tracks ticket room creation, category selections, support actions, and ticket closure archives."
  },
  suggestions: {
    title: "Suggestions & Feedback Log",
    desc: "Tracks community ideas submitted via /suggest with author info and voting status."
  },
  bugreports: {
    title: "Bug Reports Log",
    desc: "Tracks user-reported glitches, reproduction details, and bug triage status."
  },
  welcome: {
    title: "Member Welcome Log",
    desc: "Records new member joins, greeting dispatch status, and server member counts."
  },
  error: {
    title: "System Errors Log",
    desc: "Records unhandled exceptions, gateway rejections, and Discord API errors with stack traces."
  }
};

const creationLocks = new Map();

function isHttpUrl(string) {
  if (!string || typeof string !== "string") return false;
  try {
    const url = new URL(string.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Finds, restores, or creates a dedicated thread in the log channel for the given log type
 */
async function getOrCreateLogThread(client, name) {
  const channelId = config.logChannelId || process.env.LOG_CHANNEL_ID;
  if (!channelId || !client.channels) return null;

  if (!client.logThreads) client.logThreads = new Map();
  const threadName = THREAD_NAMES[name] || THREAD_NAMES.default;

  // 1. Check in-memory cached thread
  const cachedId = client.logThreads.get(name);
  if (cachedId) {
    const cached = client.channels.cache.get(cachedId);
    if (cached && !cached.archived && !cached.deleted) {
      return cached;
    }
  }

  // Prevent concurrent duplicate creation
  if (creationLocks.has(threadName)) {
    return await creationLocks.get(threadName);
  }

  const creationPromise = (async () => {
    try {
      const channel =
        client.channels.cache.get(channelId) ||
        (await client.channels.fetch(channelId).catch(() => null));

      if (!channel || !channel.isTextBased()) return null;

      let thread = null;

      // Search active threads with duplicate cleanup
      if (typeof channel.threads?.fetchActive === "function") {
        const active = await channel.threads.fetchActive().catch(() => null);
        if (active?.threads) {
          const matches = active.threads.filter((t) => t.name === threadName);
          if (matches.size > 1) {
            const list = [...matches.values()];
            thread = list[0];
            for (let i = 1; i < list.length; i++) {
              list[i].delete("Duplicate log thread cleanup").catch(() => {});
            }
          } else if (matches.size === 1) {
            thread = matches.first();
          }
        }
      }

      if (!thread && channel.threads?.cache) {
        thread = channel.threads.cache.find((t) => t.name === threadName);
      }

      // Search archived threads
      if (!thread && typeof channel.threads?.fetchArchived === "function") {
        const archived = await channel.threads.fetchArchived({ limit: 50 }).catch(() => null);
        if (archived?.threads) {
          thread = archived.threads.find((t) => t.name === threadName);
        }
      }

      // Auto-unarchive if archived
      if (thread && thread.archived) {
        await thread.setArchived(false).catch(() => {});
      }

      // Create new thread if absent
      if (!thread && typeof channel.threads?.create === "function") {
        thread = await channel.threads.create({
          name: threadName,
          autoArchiveDuration: 10080, // 7 days (maximum allowed)
          reason: `Automated helper log thread for ${name}`
        });

        const info = THREAD_DESCRIPTIONS[name] || {
          title: `${threadName} Initialized`,
          desc: `Records all ${name} activity for TOGETHER Helper.`
        };

        await thread.send({
          embeds: [
            new EmbedBuilder()
              .setColor(config.color || "#FF1E38")
              .setAuthor({
                name: `${client.user?.username || "TOGETHER HELPER"} • System Logs`,
                iconURL: client.user?.displayAvatarURL({ dynamic: true })
              })
              .setTitle(`${threadName}`)
              .setDescription(
                `**✅ ${info.title} Active**\n\n` +
                `• **Event Stream:** \`${name}\`\n` +
                `• **Log Channel:** <#${channel.id}>\n` +
                `• **Purpose:** ${info.desc}\n` +
                `• **Retention:** \`7 Days (Active auto-unarchive enabled)\``
              )
              .setTimestamp()
          ]
        }).catch(() => {});
      }

      if (thread) {
        client.logThreads.set(name, thread.id);
      }

      return thread;
    } catch (err) {
      return null;
    } finally {
      creationLocks.delete(threadName);
    }
  })();

  creationLocks.set(threadName, creationPromise);
  return await creationPromise;
}

/**
 * Pre-initializes all dedicated log threads at startup
 */
async function initAllLogThreads(client) {
  const channelId = config.logChannelId || process.env.LOG_CHANNEL_ID;
  if (!channelId) return;

  const names = Object.keys(THREAD_NAMES).filter(k => k !== "default");
  for (const name of names) {
    try {
      await getOrCreateLogThread(client, name);
    } catch {}
  }
}

/**
 * Send an event payload directly to a log thread
 */
async function dispatchLogThread(client, name, payload) {
  try {
    const thread = await getOrCreateLogThread(client, name);
    if (!thread) return null;

    if (payload instanceof EmbedBuilder) {
      return await thread.send({ embeds: [payload] }).catch(() => null);
    }
    return await thread.send(payload).catch(() => null);
  } catch {
    return null;
  }
}

module.exports = {
  isHttpUrl,
  getOrCreateLogThread,
  initAllLogThreads,
  dispatchLogThread,
  THREAD_NAMES,
  THREAD_DESCRIPTIONS
};
