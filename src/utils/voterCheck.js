const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

/**
 * Check if the given user ID belongs to a bot owner.
 * @param {import("discord.js").Client} client
 * @param {string} userId
 * @returns {boolean}
 */
function isBotOwner(client, userId) {
  if (!userId) return false;

  // Check client.config.ownerID
  if (Array.isArray(client?.config?.ownerID) && client.config.ownerID.includes(userId)) {
    return true;
  }

  // Check client.owners
  if (Array.isArray(client?.owners) && client.owners.includes(userId)) {
    return true;
  }

  // Check environment OWNER_IDS
  const envOwners = (process.env.OWNER_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (envOwners.includes(userId)) {
    return true;
  }

  return false;
}

/**
 * Checks whether a user has voted on Top.gg, or is a bot owner.
 * Bot owners always bypass the requirement.
 * @param {import("discord.js").Client} client
 * @param {string} userId
 * @returns {Promise<{ allowed: boolean, isOwner: boolean, isVoter: boolean }>}
 */
async function checkVoterAccess(client, userId) {
  if (!userId) {
    return { allowed: false, isOwner: false, isVoter: false };
  }

  // 1. Bot owner bypass
  if (isBotOwner(client, userId)) {
    return { allowed: true, isOwner: true, isVoter: true };
  }

  // 2. In-memory voted set check (populated by Top.gg webhook server or prior check)
  if (client?.votedUsers && client.votedUsers.has(userId)) {
    return { allowed: true, isOwner: false, isVoter: true };
  }

  // 3. Fallback to Top.gg API check if token and client user ID exist
  const topggToken = process.env.TOPGG_TOKEN || client?.config?.topggToken || "";
  const botId = client?.user?.id;

  if (topggToken && botId) {
    try {
      const res = await fetch(`https://top.gg/api/bots/${botId}/check?userId=${userId}`, {
        headers: {
          Authorization: topggToken,
        },
        signal: AbortSignal.timeout(3500),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && (data.voted === 1 || data.voted === true)) {
          if (!client.votedUsers) client.votedUsers = new Set();
          client.votedUsers.add(userId);
          return { allowed: true, isOwner: false, isVoter: true };
        }
      }
    } catch {
      // Ignore network errors and proceed
    }
  }

  return { allowed: false, isOwner: false, isVoter: false };
}

/**
 * Generates a Components V2 payload informing the user that the command requires a Top.gg vote.
 * @param {import("discord.js").Client} client
 * @param {string} featureName
 * @returns {object} Message reply payload
 */
function buildVoterLockPayload(client, featureName = "This feature") {
  const voteUrl = client?.config?.links?.vote ||
    (client?.user?.id ? `https://top.gg/bot/${client.user.id}/vote` : "https://top.gg");

  const warnEmoji = client?.emoji?.warn || "🔒";
  const sparklesEmoji = client?.emoji?.sparkles || "✨";

  const lockDisplay = new TextDisplayBuilder()
    .setContent(
      `### ${warnEmoji} Top.gg Voter Feature\n` +
      `> **${featureName}** is exclusively available to **Top.gg voters**!\n` +
      `> \n` +
      `> Vote for **${client?.user?.username || "TOGETHER"}** on Top.gg to unlock **Autoplay, Lyrics & 24/7 Mode** for 12 hours. ${sparklesEmoji}\n\n` +
      `-# After voting, run the command again. Votes refresh every 12 hours.`
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Vote on Top.gg")
      .setStyle(ButtonStyle.Link)
      .setURL(voteUrl)
  );

  const container = new ContainerBuilder()
    .addTextDisplayComponents(lockDisplay)
    .addSeparatorComponents(new SeparatorBuilder())
    .addActionRowComponents(row);

  return {
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  };
}

module.exports = {
  isBotOwner,
  checkVoterAccess,
  buildVoterLockPayload,
};
