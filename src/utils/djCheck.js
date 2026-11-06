const { PermissionsBitField } = require("discord.js");
const DJRole = require("../schema/djrole");

/**
 * Checks if a guild member has DJ privileges.
 * 
 * Rules:
 * 1. Bot owners always pass.
 * 2. Guild owner always passes.
 * 3. Members with Administrator or ManageGuild permissions always pass.
 * 4. If DJ role is configured and DJ mode is ON:
 *    - Member passes if they have the configured DJ role.
 *    - If member is the ONLY non-bot listener in the voice channel, they pass (solo listener exception).
 *    - If user is the track requester, they pass for skipping/stopping their own track (checked in commands or here).
 * 5. If DJ role is NOT configured, everyone passes.
 * 
 * @param {import("discord.js").GuildMember} member
 * @param {import("discord.js").Client} client
 * @param {any} [player] Optional player instance to check listeners
 * @returns {Promise<{ allowed: boolean, roleId: string|null, mode: boolean }>}
 */
async function checkDJ(member, client, player = null) {
  if (!member || !member.guild) return { allowed: true, roleId: null, mode: false };

  // 1. Bot owner bypass
  if (client.config?.ownerID?.includes(member.id)) {
    return { allowed: true, roleId: null, mode: false };
  }

  // 2. Server owner bypass
  if (member.id === member.guild.ownerId) {
    return { allowed: true, roleId: null, mode: false };
  }

  // 3. Admin / ManageGuild bypass
  if (
    member.permissions.has(PermissionsBitField.Flags.Administrator) ||
    member.permissions.has(PermissionsBitField.Flags.ManageGuild)
  ) {
    return { allowed: true, roleId: null, mode: false };
  }

  // 4. Query configured DJ role from MongoDB
  const djDoc = await DJRole.findOne({ guildId: member.guild.id }).lean().catch(() => null);

  // If no DJ role configured or mode is disabled, allow all
  if (!djDoc || !djDoc.roleId || djDoc.mode === false) {
    return { allowed: true, roleId: null, mode: false };
  }

  // Check if member has the DJ role
  const hasRole = member.roles.cache.has(djDoc.roleId);
  if (hasRole) {
    return { allowed: true, roleId: djDoc.roleId, mode: true };
  }

  // 5. Solo listener exception: If the user is the only human in the voice channel, let them control
  if (member.voice?.channel) {
    const humanListeners = member.voice.channel.members.filter(m => !m.user.bot);
    if (humanListeners.size <= 1) {
      return { allowed: true, roleId: djDoc.roleId, mode: true, solo: true };
    }
  }

  return { allowed: false, roleId: djDoc.roleId, mode: true };
}

module.exports = { checkDJ };

