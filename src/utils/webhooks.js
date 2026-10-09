const { WebhookClient, EmbedBuilder } = require("discord.js");

const THREAD_NAMES = {
  cmdrun: "📜・commands-log",
  guild_join: "📥・guild-joins",
  guild_leave: "📤・guild-leaves",
  player_create: "🎵・player-starts",
  player_delete: "⏹️・player-stops",
  black: "🚫・blacklist-log",
  error: "⚠️・system-errors",
  console: "💻・console-logs",
  failover: "🔄・audio-failover",
  default: "📋・general-logs",
};

const THREAD_DESCRIPTIONS = {
  cmdrun: {
    title: "Command Execution Log",
    desc: "Records all Prefix & Slash command interactions across all servers with executor and parameter details.",
  },
  guild_join: {
    title: "Guild Join Log",
    desc: "Tracks every new server the bot joins with member counts, server owner, and vanity invites.",
  },
  guild_leave: {
    title: "Guild Leave Log",
    desc: "Tracks every server removal or departure, preserving total server counts and timestamps.",
  },
  player_create: {
    title: "Player Sessions Log",
    desc: "Records new voice player sessions, connected voice channels, text channels, and assigned Lavalink nodes.",
  },
  player_delete: {
    title: "Player Teardown Log",
    desc: "Records player session endings, idle timeouts, queue completions, and channel departures.",
  },
  black: {
    title: "Blacklist Enforcement Log",
    desc: "Captures blocked users or servers attempting to execute restricted bot features.",
  },
  error: {
    title: "System Errors Log",
    desc: "Records runtime exceptions, unhandled rejections, and command failures with stack traces.",
  },
  console: {
    title: "Live Console Stream",
    desc: "Mirrors real-time terminal stdout/stderr logs and Lavalink cluster telemetry in colorized ANSI.",
  },
  failover: {
    title: "Audio Failover Log",
    desc: "Captures mid-song Lavalink node failover events, seamless audio rerouting, previous/new node mappings, and player timestamps.",
  },
};

function isHttpUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function warningOnce(client, key, message) {
  if (!client.webhookWarnings) client.webhookWarnings = new Set();
  if (client.webhookWarnings.has(key)) return;
  client.webhookWarnings.add(key);
  client.logger?.log(message, "warn");
}

function getWebhookClient(client, name) {
  const url = client.config?.Webhooks?.[name]?.trim();
  if (!url) return null;

  if (!client.webhookClients) client.webhookClients = new Map();
  const cached = client.webhookClients.get(name);
  if (cached?.url === url) return cached.webhook;

  try {
    const webhook = new WebhookClient({ url });
    client.webhookClients.set(name, { url, webhook });
    return webhook;
  } catch (error) {
    warningOnce(
      client,
      `invalid:${name}`,
      `[Webhook] ${name} is disabled because its URL is invalid. Leave the environment variable empty or add a complete Discord webhook URL.`,
    );
    return null;
  }
}

const creationLocks = new Map();

/**
 * Finds, restores, or creates a dedicated thread in the log channel for the given log type
 */
async function getOrCreateLogThread(client, name) {
  const channelId =
    client.config?.logging?.channelId ||
    process.env.LOG_CHANNEL_ID;

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

  // If thread creation for this name is already in progress, await the existing lock
  if (creationLocks.has(threadName)) {
    return await creationLocks.get(threadName);
  }

  const creationPromise = (async () => {
    try {
      const channel =
        client.channels.cache.get(channelId) ||
        (await client.channels.fetch(channelId).catch(() => null));

      if (!channel || !channel.isTextBased()) return null;

      // 2. Search active threads in channel with deduplication check
      let thread = null;
      if (typeof channel.threads?.fetchActive === "function") {
        const active = await channel.threads.fetchActive().catch(() => null);
        if (active?.threads) {
          const matches = active.threads.filter((t) => t.name === threadName);
          if (matches.size > 1) {
            const list = [...matches.values()];
            thread = list[0];
            for (let i = 1; i < list.length; i++) {
              list[i].delete("Duplicate log thread auto-cleanup").catch(() => {});
            }
          } else if (matches.size === 1) {
            thread = matches.first();
          }
        }
      }

      if (!thread && channel.threads?.cache) {
        thread = channel.threads.cache.find((t) => t.name === threadName);
      }

      // 3. Search archived threads in channel
      if (!thread && typeof channel.threads?.fetchArchived === "function") {
        const archived = await channel.threads.fetchArchived({ limit: 50 }).catch(() => null);
        if (archived?.threads) {
          thread = archived.threads.find((t) => t.name === threadName);
        }
      }

      // 4. If archived, unarchive it
      if (thread && thread.archived) {
        await thread.setArchived(false).catch(() => {});
      }

      // 5. If not found, create new thread in the channel
      if (!thread && typeof channel.threads?.create === "function") {
        thread = await channel.threads.create({
          name: threadName,
          autoArchiveDuration: 10080, // 7 days (maximum allowed)
          reason: `Automated log thread for ${name}`,
        });

        const info = THREAD_DESCRIPTIONS[name] || {
          title: `${threadName} Initialized`,
          desc: `This thread will automatically record all ${name} actions and logs.`,
        };

        // Send initial welcome message
        await thread.send({
          embeds: [
            new EmbedBuilder()
              .setColor(client.color || "#3F4652")
              .setAuthor({
                name: `${client.user?.username || "TOGETHER"} • System Logs`,
                iconURL: client.user?.displayAvatarURL({ dynamic: true }),
              })
              .setTitle(`${threadName}`)
              .setDescription(
                `**${client.emoji?.check || "✅"} ${info.title} Initialized**\n\n` +
                `**${client.emoji?.dot || "•"} Stream Event:** \`${name}\`\n` +
                `**${client.emoji?.dot || "•"} Parent Channel:** <#${channel.id}>\n` +
                `**${client.emoji?.dot || "•"} Purpose:** ${info.desc}\n` +
                `**${client.emoji?.dot || "•"} Retention:** \`7 Days (Active auto-unarchive enabled)\`\n\n` +
                `*All upcoming ${name} logs and telemetry will be recorded here automatically.*`
              )
              .setFooter({
                text: `${client.user?.username || "TOGETHER"} • Thread Logger Sentinel`,
                iconURL: client.user?.displayAvatarURL({ dynamic: true }),
              })
              .setTimestamp(),
          ],
        }).catch(() => {});
      }

      if (thread) {
        client.logThreads.set(name, thread.id);
      }
      return thread;
    } catch (error) {
      client.logger?.log(`[LogThread] Error managing thread for "${name}": ${error.message}`, "warn");
      return null;
    } finally {
      creationLocks.delete(threadName);
    }
  })();

  creationLocks.set(threadName, creationPromise);
  return await creationPromise;
}

/**
 * Ensures all log threads defined in THREAD_NAMES exist and are cached.
 * Creates any threads that do not exist yet with their dedicated welcome embed.
 */
async function initAllLogThreads(client) {
  const channelId =
    client.config?.logging?.channelId ||
    process.env.LOG_CHANNEL_ID;

  if (!channelId || !client.channels) return;


  client.logger?.log("[LogThread] Verifying all Discord log threads in channel...", "info");

  const threadKeys = Object.keys(THREAD_NAMES).filter((k) => k !== "default");
  let readyCount = 0;

  for (const key of threadKeys) {
    try {
      const thread = await getOrCreateLogThread(client, key);
      if (thread) readyCount++;
    } catch (err) {
      client.logger?.log(`[LogThread] Failed initializing thread for ${key}: ${err.message}`, "warn");
    }
  }

  client.logger?.log(
    `[LogThread] All ${readyCount}/${threadKeys.length} log threads verified and active in #${channelId}`,
    "ready"
  );
}

/**
 * Sends a log entry.
 * Primary: Dedicated Discord Thread in #logs (1551909877356695562).
 * Secondary: Fallback to Webhook URL if thread is unavailable.
 */
async function sendWebhook(client, name, payload) {
  // 1. Thread logging (Primary)
  try {
    const thread = await getOrCreateLogThread(client, name);
    if (thread) {
      await thread.send(payload);
      if (name !== "console") {
        client.logger?.log(
          `[LogThread] Dispatched "${name}" log to thread "${thread.name}"`,
          "event"
        );
      }
      return true;
    }
  } catch (threadErr) {
    if (name !== "console") {
      client.logger?.log(`[LogThread] Failed to send to thread for "${name}": ${threadErr.message}`, "warn");
    }
  }

  // 2. Webhook fallback (Secondary)
  const webhook = getWebhookClient(client, name);
  if (!webhook) return false;

  try {
    await webhook.send(payload);
    if (name !== "console") {
      client.logger?.log(`[LogWebhook] Dispatched "${name}" log via webhook fallback`, "event");
    }
    return true;
  } catch (error) {
    warningOnce(
      client,
      `send:${name}`,
      `[Webhook] ${name} delivery failed: ${error.message}`,
    );
    return false;
  }
}

module.exports = {
  getWebhookClient,
  isHttpUrl,
  sendWebhook,
  sendLog: sendWebhook,
  getOrCreateLogThread,
  initAllLogThreads,
  THREAD_NAMES,
  THREAD_DESCRIPTIONS,
};
