const { EmbedBuilder } = require("discord.js");

const THREAD_NAMES = {
  console: "💻・console-logs",
  cmdrun: "📜・commands-log",
  guild_join: "📥・guild-joins",
  guild_leave: "📤・guild-leaves",
  error: "⚠️・system-errors",
  tickets: "📩・ticket-logs",
  default: "📋・general-logs",
};

const creationLocks = new Map();

/**
 * Finds, restores, or creates a dedicated thread in the log channel for the given log type
 */
async function getOrCreateLogThread(client, name) {
  const channelId =
    client.config?.logChannelId ||
    process.env.LOG_CHANNEL_ID ||
    "1568284208533864498";

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

  // Deduplicate active creation attempts
  if (creationLocks.has(threadName)) {
    return await creationLocks.get(threadName);
  }

  const creationPromise = (async () => {
    try {
      const channel =
        client.channels.cache.get(channelId) ||
        (await client.channels.fetch(channelId).catch(() => null));

      if (!channel || !channel.isTextBased()) return null;

      // 2. Search active threads in channel
      let thread = null;
      if (typeof channel.threads?.fetchActive === "function") {
        const active = await channel.threads.fetchActive().catch(() => null);
        if (active?.threads) {
          thread = active.threads.find((t) => t.name === threadName);
        }
      }

      if (!thread && channel.threads?.cache) {
        thread = channel.threads.cache.find((t) => t.name === threadName);
      }

      // 3. Search archived threads
      if (!thread && typeof channel.threads?.fetchArchived === "function") {
        const archived = await channel.threads.fetchArchived({ limit: 50 }).catch(() => null);
        if (archived?.threads) {
          thread = archived.threads.find((t) => t.name === threadName);
        }
      }

      // 4. Unarchive if needed
      if (thread && thread.archived) {
        await thread.setArchived(false).catch(() => {});
      }

      // 5. Create new thread if absent
      if (!thread && typeof channel.threads?.create === "function") {
        thread = await channel.threads.create({
          name: threadName,
          autoArchiveDuration: 10080,
          reason: `Automated log thread for ${name}`,
        });

        await thread.send({
          embeds: [
            new EmbedBuilder()
              .setColor("#FF1E38")
              .setAuthor({
                name: `${client.user?.username || "TOGETHER HELPER"} • System Logs`,
                iconURL: client.user?.displayAvatarURL({ dynamic: true }),
              })
              .setTitle(`${threadName}`)
              .setDescription(
                `**✅ ${threadName} Thread Connected**\n\n` +
                `**• Stream Module:** \`together-helper\`\n` +
                `**• Parent Channel:** <#${channel.id}>\n` +
                `**• Real-time console & event streaming active.**`
              )
              .setTimestamp()
          ]
        }).catch(() => {});
      }

      if (thread) {
        client.logThreads.set(name, thread.id);
      }

      return thread;
    } catch (error) {
      console.warn(`[LogThread] Error resolving thread for "${name}":`, error.message);
      return null;
    } finally {
      creationLocks.delete(threadName);
    }
  })();

  creationLocks.set(threadName, creationPromise);
  return await creationPromise;
}

module.exports = {
  getOrCreateLogThread,
  THREAD_NAMES
};
