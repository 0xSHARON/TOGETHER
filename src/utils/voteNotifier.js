const http = require("node:http");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageFlags,
  SeparatorBuilder,
  TextDisplayBuilder,
} = require("discord.js");

const VOTE_CHANNEL_ID = "1524235256339890327";

/**
 * Sends a message announcing who voted to channel 1524235256339890327
 * @param {import("discord.js").Client} client
 * @param {string|import("discord.js").User} userIdOrUser
 * @param {object} meta
 */
async function sendVoteNotification(client, userIdOrUser, meta = {}) {
  try {
    const channelId = client.config?.voteChannelId || VOTE_CHANNEL_ID;
    let channel = client.channels.cache.get(channelId);
    if (!channel) {
      channel = await client.channels.fetch(channelId).catch(() => null);
    }

    if (!channel) {
      client.logger?.log(`[Vote Notification] Target channel ${channelId} not found or inaccessible.`, "warn");
      return null;
    }

    let user = typeof userIdOrUser === "object" && userIdOrUser ? userIdOrUser : null;
    const userId = user ? user.id : String(userIdOrUser);

    if (!user && userId) {
      user = client.users.cache.get(userId) || (await client.users.fetch(userId).catch(() => null));
    }

    const checkEmoji = client.emoji?.check || "✅";
    const sparklesEmoji = client.emoji?.sparkles || "✨";
    const starEmoji = client.emoji?.star || "⭐";
    const musicEmoji = client.emoji?.music || "🎵";

    const userTag = user ? `${user.username}` : `User ${userId}`;
    const userMention = `<@${userId}>`;
    const voteUrl = client.config?.links?.vote ||
      (client.user?.id ? `https://top.gg/bot/${client.user.id}/vote` : "https://top.gg");

    const weekendBadge = meta.isWeekend ? `\n> ${starEmoji} **Weekend Multiplier Active!**` : "";

    const voteDisplay = new TextDisplayBuilder()
      .setContent(
        `### ${sparklesEmoji} New Top.gg Vote!\n` +
        `> ${checkEmoji} **${userMention}** (\`${userTag}\`) has voted for **${client.user?.username || "TOGETHER"}** on **Top.gg**!\n` +
        `> \n` +
        `> *Thank you for voting! Your support keeps the music playing ${musicEmoji}*${weekendBadge}\n\n` +
        `-# Top.gg vote refreshes every 12 hours.`
      );

    const voteRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Vote on Top.gg")
        .setStyle(ButtonStyle.Link)
        .setURL(voteUrl)
    );

    const container = new ContainerBuilder()
      .addTextDisplayComponents(voteDisplay)
      .addSeparatorComponents(new SeparatorBuilder())
      .addActionRowComponents(voteRow);

    const sentMessage = await channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    client.logger?.log(`[Vote] Announced vote from ${userTag} (${userId}) in #${channel.name || channelId}`, "ready");
    return sentMessage;
  } catch (error) {
    client.logger?.log(`[Vote Notification Error] ${error.message}`, "error");
    return null;
  }
}

/**
 * Handles incoming Top.gg vote webhook requests (compatible with internal port 5000 and external https://together.dpdns.org/webhook)
 * @param {import("discord.js").Client} client
 * @param {import("http").IncomingMessage} req
 * @param {import("http").ServerResponse} res
 */
function handleVoteWebhook(client, req, res) {
  const authSecret = process.env.TOPGG_WEBHOOK_AUTH || client.config?.topggWebhookAuth || "";

  if (req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({
      status: "ok",
      service: "Top.gg Vote Webhook Server",
      active: true,
      endpoint: "https://together.dpdns.org/webhook",
      authRequired: Boolean(authSecret)
    }));
  }

  if (req.method === "POST") {
    if (authSecret && req.headers.authorization !== authSecret) {
      client?.logger?.log(`[Vote Webhook] Unauthorized request rejected from ${req.socket?.remoteAddress || "remote"}`, "warn");
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Unauthorized" }));
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      try {
        const data = JSON.parse(body || "{}");
        const voterId = data.user;

        if (voterId) {
          if (!client.votedUsers) client.votedUsers = new Set();
          if (!client.announcedVotes) client.announcedVotes = new Set();

          client.votedUsers.add(voterId);
          client.announcedVotes.add(voterId);

          client?.logger?.log(`[Vote Webhook] Received vote for user ${voterId} (type: ${data.type || "upvote"}, weekend: ${Boolean(data.isWeekend)})`, "ready");

          await sendVoteNotification(client, voterId, {
            isWeekend: Boolean(data.isWeekend),
            type: data.type || "upvote",
          });
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, user: voterId }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(405, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Method Not Allowed" }));
}

/**
 * Initializes the Top.gg vote listener and attaches notification helpers
 * @param {import("discord.js").Client} client
 */
function initVoteSystem(client) {
  if (client._voteSystemInitialized) return;
  client._voteSystemInitialized = true;

  if (!client.votedUsers) {
    client.votedUsers = new Set();
  }
  if (!client.announcedVotes) {
    client.announcedVotes = new Set();
  }

  client.sendVoteNotification = (userIdOrUser, meta) => sendVoteNotification(client, userIdOrUser, meta);

  const isClusterZero = !client.cluster || client.cluster.id === 0;
  const enableWebhook = process.env.ENABLE_VOTE_WEBHOOK !== "false";

  if (isClusterZero && enableWebhook) {
    const port = Number(process.env.VOTE_PORT) || client.config?.votePort || 5000;

    const server = http.createServer((req, res) => handleVoteWebhook(client, req, res));

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        client.logger?.log(`[Vote Webhook Server] Port ${port} is in use; skipping internal HTTP listener.`, "warn");
      } else {
        client.logger?.log(`[Vote Webhook Server Error] ${err.message}`, "error");
      }
    });

    try {
      server.listen(port, () => {
        client.logger?.log(`[Vote Webhook Server] Listening for Top.gg webhooks on port ${port}`, "ready");
      });
    } catch (e) {
      client.logger?.log(`[Vote Webhook Server] Could not bind to port ${port}: ${e.message}`, "warn");
    }
  }
}

module.exports = {
  VOTE_CHANNEL_ID,
  sendVoteNotification,
  handleVoteWebhook,
  initVoteSystem,
};
