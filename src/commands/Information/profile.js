const {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags,
} = require("discord.js");
const { renderProfileCanvas } = require("../../utils/profileCanvas");
const UserPreferences = require("../../schema/userpreferences");
const Liked = require("../../schema/liked");
const { container, flags, noticePayload, separator, text } = require("../../utils/ui");
const emoji = require("../../emojis");

function computeRealBadges(pref, likedCount) {
  const badges = [];
  const songsCount = Math.max(0, Number(pref?.songsPlayed) || 0);
  const secCount = Math.max(0, Number(pref?.listeningSeconds) || 0);
  const streakCount = Math.max(0, Number(pref?.streak) || 0);
  const level = Math.max(1, Number(pref?.level) || 1);
  const likes = Math.max(0, Number(likedCount) || 0);

  if (songsCount >= 1) badges.push("vinyl");
  if (secCount >= 3600) badges.push("wave");
  if (level >= 5 || songsCount >= 50) badges.push("crown");
  if (pref?.anthem?.title) badges.push("star");
  if (streakCount >= 2) badges.push("planet");
  if (likes >= 1) badges.push("bars");

  return badges;
}

function buildProfileCard(user, pref, likedCount, viewerId) {
  const totalSec = Math.max(0, Number(pref?.listeningSeconds) || 0);
  const hoursNum = Math.floor(totalSec / 3600);
  const minutesNum = Math.floor((totalSec % 3600) / 60);
  const hoursStr = hoursNum > 0 ? `${hoursNum}h` : (minutesNum > 0 ? `${minutesNum}m` : "0h");
  const songsCount = Math.max(0, Number(pref?.songsPlayed) || 0);
  const songsStr = songsCount.toLocaleString();
  const streakCount = Math.max(0, Number(pref?.streak) || 0);
  const streakStr = `${streakCount} ${streakCount === 1 ? "day" : "days"}`;
  const level = Math.max(1, Number(pref?.level) || 1);
  const xp = Math.max(0, Number(pref?.xp) || 0);
  const maxXP = Math.max(100, level * 100);

  const card = container();

  // 1. Top Neo-Brutalist Canvas Banner inside Media Gallery
  card.addMediaGalleryComponents(
    new MediaGalleryBuilder().addItems(
      new MediaGalleryItemBuilder()
        .setURL("attachment://profile.png")
        .setDescription(`${user.displayName || user.username}'s Music Profile`),
    ),
  );

  // 2. Identity Header & Description
  const anthemDisplay = pref?.anthem?.title ? `\`${pref.anthem.title}\`` : "*No signature anthem set*";
  const bioDisplay = pref?.bio?.trim() ? pref.bio.trim() : "*No bio set yet. Click Edit Profile to add one.*";

  const isOwner = !viewerId || viewerId === user.id;

  card
    .addTextDisplayComponents(
      text(`## ${emoji.music || "🎵"} ${user.displayName || user.username}\n-# @${user.username} · Member Music Profile`),
    )
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(
      text(`> ${emoji.sparkles || "✨"} **Bio:** *${bioDisplay}*\n> ${emoji.vinyl || "💿"} **Anthem:** ${anthemDisplay}`),
    )
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(
      text(
        `${emoji.level || "⚡"} **Level:** \`${level}\`  ${emoji.sparkles || "✨"} **XP:** \`${xp.toLocaleString()} / ${maxXP.toLocaleString()}\`\n` +
        `${emoji.time || "⏱️"} **Listened:** \`${hoursStr}\`  ${emoji.headphones || "🎧"} **Songs:** \`${songsStr}\`\n` +
        `${emoji.fire || "🔥"} **Streak:** \`${streakStr}\`  ${emoji.favourite || "❤️"} **Liked:** \`${likedCount} tracks\``,
      ),
    )
    .addSeparatorComponents(separator())
    .addTextDisplayComponents(
      text(`-# ${emoji.info || "ℹ️"} Click **${isOwner ? "Edit Profile" : "Customize My Profile"}** below to personalize your bio, accent color, and signature anthem.`),
    );

  // 3. Action Row with Bot UI Buttons
  const row = new ActionRowBuilder();

  row.addComponents(
    new ButtonBuilder()
      .setCustomId(`profile_edit_${user.id}`)
      .setLabel(isOwner ? "Edit Profile" : "Customize My Profile")
      .setEmoji(emoji.config || "⚙️")
      .setStyle(ButtonStyle.Success),
  );

  if (pref?.anthem?.title) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`profile_anthem_${user.id}`)
        .setLabel("Play Anthem")
        .setEmoji(emoji.play || "▶️")
        .setStyle(ButtonStyle.Primary),
    );
  }

  row.addComponents(
    new ButtonBuilder()
      .setCustomId(`profile_liked_${user.id}`)
      .setLabel(`Liked Tracks (${likedCount})`)
      .setEmoji(emoji.favourite || "❤️")
      .setStyle(ButtonStyle.Secondary),
  );

  card.addActionRowComponents(row);

  return { card, hoursStr, songsStr, streakStr, level, xp, maxXP };
}

module.exports = {
  name: "profile",
  category: "Information",
  aliases: ["pcard", "myprofile", "userprofile"],
  cooldown: 5,
  description: "Display your brutalist music profile card or customize your bio/theme.",
  args: false,
  usage: "[@user | set bio <text> | set color <hex> | set anthem <song> | edit]",
  userPerms: [],
  botPerms: ["AttachFiles", "EmbedLinks"],

  slashOptions: [
    {
      name: "user",
      description: "User whose music profile you want to view",
      type: 6, // USER
      required: false,
    },
    {
      name: "bio",
      description: "Set your custom profile bio (up to 80 chars, empty to clear)",
      type: 3, // STRING
      required: false,
    },
    {
      name: "color",
      description: "Set your profile accent color in HEX (e.g. #FF1E38)",
      type: 3, // STRING
      required: false,
    },
    {
      name: "anthem",
      description: "Set your signature anthem song name (empty to clear)",
      type: 3, // STRING
      required: false,
    },
  ],

  async slashExecute(interaction, client) {
    const targetUser = interaction.options.getUser("user") || interaction.user;
    const newBio = interaction.options.getString("bio");
    const newColor = interaction.options.getString("color");
    const newAnthem = interaction.options.getString("anthem");

    await interaction.deferReply();

    // Check if user is updating preferences directly via slash options
    if (newBio !== null || newColor !== null || newAnthem !== null) {
      let pref = await UserPreferences.findOne({ userId: interaction.user.id });
      if (!pref) {
        pref = new UserPreferences({ userId: interaction.user.id });
      }

      const updates = [];
      if (newBio !== null) {
        const trimmedBio = newBio.trim().slice(0, 80);
        pref.bio = trimmedBio;
        updates.push(trimmedBio ? `• **Bio:** \`${trimmedBio}\`` : `• **Bio:** *Cleared*`);
      }
      if (newColor !== null) {
        const hex = newColor.startsWith("#") ? newColor : `#${newColor}`;
        if (/^#[0-9A-F]{6}$/i.test(hex)) {
          pref.accentColor = hex.toUpperCase();
          updates.push(`• **Accent Color:** \`${pref.accentColor}\``);
        } else {
          updates.push(`• **Accent Color:** *Invalid HEX (kept \`${pref.accentColor || "#FF1E38"}\`)*`);
        }
      }
      if (newAnthem !== null) {
        const anthemTitle = newAnthem.trim().slice(0, 60);
        if (anthemTitle) {
          pref.anthem = { title: anthemTitle, artist: "", uri: "" };
          updates.push(`• **Anthem:** \`${pref.anthem.title}\``);
        } else {
          pref.anthem = null;
          updates.push(`• **Anthem:** *Cleared*`);
        }
      }

      await pref.save();

      return interaction.editReply(
        noticePayload({
          title: "Profile Updated",
          description: updates.join("\n"),
          emoji: emoji.check || "✅",
          tone: "success",
        }),
      );
    }

    // Render Profile Card
    return this.sendProfile(interaction, targetUser, client, null, interaction.user.id);
  },

  async execute(message, args, client, prefix) {
    const sub = args[0]?.toLowerCase();

    // Interactive edit prompt if user simply types .profile edit or .profile set
    if ((sub === "edit" || sub === "set") && !args[1]) {
      const editCard = container()
        .addTextDisplayComponents(
          text(
            `## ${emoji.config || "⚙️"} Customize Music Profile\n` +
            `> \`${prefix}profile bio <text>\` — Update your custom bio\n` +
            `> \`${prefix}profile color <hex>\` — Set accent color (e.g. \`#FF1E38\`)\n` +
            `> \`${prefix}profile anthem <song>\` — Set your signature anthem\n` +
            `> \`${prefix}profile clear [bio|anthem]\` — Clear a field\n\n` +
            `*Or click the button below to edit interactively in a popup modal!*`
          )
        )
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`profile_edit_${message.author.id}`)
              .setLabel("Open Edit Modal")
              .setEmoji(emoji.config || "⚙️")
              .setStyle(ButtonStyle.Success)
          )
        );

      return message.reply({ components: [editCard], flags: flags() });
    }

    // Check for direct subcommands (e.g. .profile set bio <text>, .profile edit bio <text>, .profile bio <text>)
    if (sub === "set" || sub === "edit" || sub === "bio" || sub === "color" || sub === "anthem" || sub === "clear" || sub === "reset") {
      let type = sub;
      let val = "";

      if (sub === "set" || sub === "edit") {
        type = args[1]?.toLowerCase();
        val = args.slice(2).join(" ").trim();
      } else if (sub === "clear" || sub === "reset") {
        type = args[1]?.toLowerCase();
        val = ""; // clear
      } else {
        val = args.slice(1).join(" ").trim();
      }

      if (!type || (sub !== "clear" && sub !== "reset" && !val && type !== "clear")) {
        return message.reply(
          noticePayload({
            title: "Profile Customization Usage",
            description:
              `> \`${prefix}profile bio <text>\` — Update your bio\n` +
              `> \`${prefix}profile color <hex>\` — Set accent color (e.g. \`#FF1E38\`)\n` +
              `> \`${prefix}profile anthem <song>\` — Set signature anthem\n` +
              `> \`${prefix}profile clear bio\` — Clear your bio\n` +
              `> \`${prefix}profile clear anthem\` — Clear your anthem`,
            emoji: emoji.info || "ℹ️",
            tone: "info",
          }),
        );
      }

      let pref = await UserPreferences.findOne({ userId: message.author.id });
      if (!pref) {
        pref = new UserPreferences({ userId: message.author.id });
      }

      if (type === "bio") {
        pref.bio = val ? val.slice(0, 80) : "";
        await pref.save();
        return message.reply(
          noticePayload({
            title: pref.bio ? "Bio Updated" : "Bio Cleared",
            description: pref.bio ? `**Bio set to:** \`${pref.bio}\`` : "*Your profile bio has been cleared.*",
            emoji: emoji.check || "✅",
            tone: "success",
          }),
        );
      } else if (type === "color") {
        const hex = val.startsWith("#") ? val : `#${val}`;
        if (!/^#[0-9A-F]{6}$/i.test(hex)) {
          return message.reply(
            noticePayload({
              title: "Invalid Color",
              description: `Provide a valid 6-character HEX code (e.g. \`#FF1E38\`).`,
              emoji: emoji.cross || "❌",
              tone: "danger",
            }),
          );
        }
        pref.accentColor = hex.toUpperCase();
        await pref.save();
        return message.reply(
          noticePayload({
            title: "Accent Color Updated",
            description: `**Accent color set to:** \`${pref.accentColor}\``,
            emoji: emoji.check || "✅",
            tone: "success",
          }),
        );
      } else if (type === "anthem") {
        if (val) {
          pref.anthem = { title: val.slice(0, 60), artist: "", uri: "" };
          await pref.save();
          return message.reply(
            noticePayload({
              title: "Anthem Updated",
              description: `**Signature anthem set to:** \`${pref.anthem.title}\``,
              emoji: emoji.check || "✅",
              tone: "success",
            }),
          );
        } else {
          pref.anthem = null;
          await pref.save();
          return message.reply(
            noticePayload({
              title: "Anthem Cleared",
              description: "*Your signature anthem has been removed.*",
              emoji: emoji.check || "✅",
              tone: "success",
            }),
          );
        }
      }
    }

    // Otherwise, view profile (mentioned user or message.author)
    let targetUser = message.author;
    if (message.mentions.users.first()) {
      targetUser = message.mentions.users.first();
    } else if (args[0] && /^\d{17,20}$/.test(args[0])) {
      try {
        targetUser = await client.users.fetch(args[0]);
      } catch {}
    }

    const loadCard = container().addTextDisplayComponents(
      text(`**${emoji.load || "⏳"} Rendering brutalist music profile...**`),
    );
    const loadMsg = await message.reply({
      components: [loadCard],
      flags: flags(),
    }).catch(() => null);

    return this.sendProfile(loadMsg || message, targetUser, client, message, message.author.id);
  },

  async sendProfile(target, user, client, originalMessage, viewerId) {
    try {
      let pref = await UserPreferences.findOne({ userId: user.id });
      if (!pref) {
        pref = {
          bio: "",
          accentColor: "#FF1E38",
          songsPlayed: 0,
          listeningSeconds: 0,
          streak: 0,
          level: 1,
          xp: 0,
          anthem: null,
        };
      }

      let likedCount = 0;
      try {
        const likedDoc = await Liked.findOne({ userId: user.id });
        if (likedDoc?.songs?.length) likedCount = likedDoc.songs.length;
      } catch {}

      const { card, hoursStr, songsStr, streakStr, level, xp, maxXP } = buildProfileCard(
        user,
        pref,
        likedCount,
        viewerId || user.id,
      );

      const badges = computeRealBadges(pref, likedCount);

      const profilePayload = {
        bio: pref.bio || "",
        accentColor: pref.accentColor || "#FF1E38",
        listeningHours: hoursStr,
        songsPlayed: songsStr,
        streak: streakStr,
        level: level,
        xp: xp,
        maxXP: maxXP,
        badges: badges,
        anthem: pref.anthem,
      };

      const canvasBuffer = await renderProfileCanvas(user, profilePayload);
      const attachment = new AttachmentBuilder(canvasBuffer, { name: "profile.png" });

      const responsePayload = {
        components: [card],
        files: [attachment],
        flags: flags(),
      };

      if (target.isCommand?.() || target.editReply) {
        return await target.editReply(responsePayload);
      } else if (target.edit && typeof target.edit === "function") {
        return await target.edit(responsePayload).catch(async () => {
          if (originalMessage?.channel?.send) {
            return await originalMessage.channel.send(responsePayload);
          }
        });
      } else if (target.channel?.send) {
        return await target.channel.send(responsePayload);
      }
    } catch (err) {
      console.error("[Profile Command] Error:", err);
      const errNotice = noticePayload({
        title: "Rendering Error",
        description: `Failed to render profile card: ${err.message}`,
        emoji: emoji.cross || "❌",
        tone: "danger",
      });

      if (target.isCommand?.() || target.editReply) {
        return target.editReply(errNotice).catch(() => {});
      } else if (target.edit) {
        return target.edit(errNotice).catch(() => {});
      } else if (target.channel?.send) {
        return target.channel.send(errNotice).catch(() => {});
      }
    }
  },

  async componentsV2(interaction, client) {
    const parts = interaction.customId.split("_");
    const action = parts[1]; // "edit", "anthem", or "liked"
    const targetUserId = parts[2];

    // Handle Edit Profile button (Opens Modal)
    if (action === "edit") {
      // Always customize the profile of the user who clicked the button!
      let pref = await UserPreferences.findOne({ userId: interaction.user.id });
      const currentBio = pref?.bio || "";
      const currentColor = pref?.accentColor || "#FF1E38";
      const currentAnthem = pref?.anthem?.title || "";

      const modal = new ModalBuilder()
        .setCustomId(`profile_edit_modal_${interaction.user.id}`)
        .setTitle("Edit Music Profile");

      const bioInput = new TextInputBuilder()
        .setCustomId("profile_bio_input")
        .setLabel("Bio (up to 80 characters)")
        .setStyle(TextInputStyle.Paragraph)
        .setValue(currentBio.slice(0, 80))
        .setPlaceholder("Share your music taste or vibe...")
        .setMaxLength(80)
        .setRequired(false);

      const colorInput = new TextInputBuilder()
        .setCustomId("profile_color_input")
        .setLabel("Accent Color HEX (#RRGGBB)")
        .setStyle(TextInputStyle.Short)
        .setValue(currentColor)
        .setPlaceholder("#FF1E38")
        .setMaxLength(7)
        .setRequired(false);

      const anthemInput = new TextInputBuilder()
        .setCustomId("profile_anthem_input")
        .setLabel("Signature Anthem (Song title)")
        .setStyle(TextInputStyle.Short)
        .setValue(currentAnthem.slice(0, 60))
        .setPlaceholder("e.g. The Weeknd - Starboy")
        .setMaxLength(60)
        .setRequired(false);

      modal.addComponents(
        new ActionRowBuilder().addComponents(bioInput),
        new ActionRowBuilder().addComponents(colorInput),
        new ActionRowBuilder().addComponents(anthemInput),
      );

      return await interaction.showModal(modal);
    }

    if (!interaction.member?.voice?.channel) {
      return interaction.reply(
        noticePayload(
          {
            title: "Voice Channel Required",
            description: "You must be in a voice channel to play music.",
            emoji: emoji.warn || "⚠️",
            tone: "warning",
          },
          true,
        ),
      );
    }

    const channel = interaction.member.voice.channel;

    if (action === "anthem") {
      const pref = await UserPreferences.findOne({ userId: targetUserId });
      if (!pref?.anthem?.title) {
        return interaction.reply(
          noticePayload(
            {
              title: "No Anthem Configured",
              description: "This user has not set a signature anthem song yet.",
              emoji: emoji.cross || "❌",
              tone: "danger",
            },
            true,
          ),
        );
      }

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      let player = client.manager.players.get(interaction.guild.id);
      if (!player) {
        player = await client.manager.createPlayer({
          guildId: interaction.guild.id,
          voiceId: channel.id,
          textId: interaction.channel.id,
          volume: 80,
          deaf: true,
        });
      }

      const res = await client.manager.search(pref.anthem.title, {
        requester: interaction.user,
        engine: client.config?.node_source || "scsearch",
      });

      if (!res || !res.tracks || !res.tracks.length) {
        return interaction.editReply(
          noticePayload(
            {
              title: "Track Not Found",
              description: "Could not resolve anthem track for playback.",
              emoji: emoji.cross || "❌",
              tone: "danger",
            },
            true,
          ),
        );
      }

      const track = res.tracks[0];
      player.queue.add(track);

      if (!player.playing && !player.paused) {
        await player.play();
      }

      return interaction.editReply(
        noticePayload(
          {
            title: "Anthem Queued",
            description: `Queued [${track.title}](${track.uri}) to play.`,
            emoji: emoji.play || "▶️",
            tone: "success",
          },
          true,
        ),
      );
    }

    if (action === "liked") {
      const likedDoc = await Liked.findOne({ userId: targetUserId });
      if (!likedDoc || !likedDoc.songs || !likedDoc.songs.length) {
        return interaction.reply(
          noticePayload(
            {
              title: "No Liked Tracks",
              description: "This user does not have any saved liked tracks.",
              emoji: emoji.cross || "❌",
              tone: "danger",
            },
            true,
          ),
        );
      }

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      let player = client.manager.players.get(interaction.guild.id);
      if (!player) {
        player = await client.manager.createPlayer({
          guildId: interaction.guild.id,
          voiceId: channel.id,
          textId: interaction.channel.id,
          volume: 80,
          deaf: true,
        });
      }

      let added = 0;
      for (const s of likedDoc.songs.slice(0, 15)) {
        try {
          const res = await client.manager.search(s.url || s.title, { requester: interaction.user });
          if (res?.tracks?.[0]) {
            player.queue.add(res.tracks[0]);
            added++;
          }
        } catch {}
      }

      if (!player.playing && !player.paused && player.queue.length > 0) {
        await player.play();
      }

      return interaction.editReply(
        noticePayload(
          {
            title: "Liked Tracks Queued",
            description: `Queued \`${added}\` track(s) from user's liked library.`,
            emoji: emoji.favourite || "❤️",
            tone: "success",
          },
          true,
        ),
      );
    }
  },

  async handleModalSubmit(interaction) {
    // Acknowledge interaction immediately (<3s limit) to avoid "This interaction failed" error
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const newBio = interaction.fields.getTextInputValue("profile_bio_input")?.trim();
      const newColor = interaction.fields.getTextInputValue("profile_color_input")?.trim();
      const newAnthem = interaction.fields.getTextInputValue("profile_anthem_input")?.trim();

      let pref = await UserPreferences.findOne({ userId: interaction.user.id });
      if (!pref) {
        pref = new UserPreferences({ userId: interaction.user.id });
      }

      const updates = [];

      if (newBio !== undefined) {
        if (newBio.length > 0) {
          pref.bio = newBio.slice(0, 80);
          updates.push(`• **Bio:** \`${pref.bio}\``);
        } else {
          pref.bio = "";
          updates.push(`• **Bio:** *Cleared*`);
        }
      }

      if (newColor !== undefined && newColor.length > 0) {
        const hex = newColor.startsWith("#") ? newColor : `#${newColor}`;
        if (/^#[0-9A-F]{6}$/i.test(hex)) {
          pref.accentColor = hex.toUpperCase();
          updates.push(`• **Accent Color:** \`${pref.accentColor}\``);
        } else {
          updates.push(`• **Accent Color:** *Invalid HEX (kept \`${pref.accentColor || "#FF1E38"}\`)*`);
        }
      }

      if (newAnthem !== undefined) {
        if (newAnthem.length > 0) {
          pref.anthem = { title: newAnthem.slice(0, 60), artist: "", uri: "" };
          updates.push(`• **Anthem:** \`${pref.anthem.title}\``);
        } else {
          pref.anthem = null;
          updates.push(`• **Anthem:** *Cleared*`);
        }
      }

      await pref.save();

      // Live-update the profile card message if available
      if (interaction.message && interaction.message.editable) {
        try {
          const parts = interaction.customId.split("_");
          const targetUserId = parts[3];
          if (targetUserId === interaction.user.id) {
            let likedCount = 0;
            try {
              const likedDoc = await Liked.findOne({ userId: interaction.user.id });
              if (likedDoc?.songs?.length) likedCount = likedDoc.songs.length;
            } catch {}

            const { card, hoursStr, songsStr, streakStr, level, xp, maxXP } = buildProfileCard(
              interaction.user,
              pref,
              likedCount,
              interaction.user.id,
            );

            const badges = computeRealBadges(pref, likedCount);

            const profilePayload = {
              bio: pref.bio || "",
              accentColor: pref.accentColor || "#FF1E38",
              listeningHours: hoursStr,
              songsPlayed: songsStr,
              streak: streakStr,
              level: level,
              xp: xp,
              maxXP: maxXP,
              badges: badges,
              anthem: pref.anthem,
            };

            const canvasBuffer = await renderProfileCanvas(interaction.user, profilePayload);
            const attachment = new AttachmentBuilder(canvasBuffer, { name: "profile.png" });

            await interaction.message.edit({
              components: [card],
              files: [attachment],
              flags: flags(),
            }).catch(() => {});
          }
        } catch (liveErr) {
          console.error("[Profile Modal] Live update failed:", liveErr);
        }
      }

      return await interaction.editReply(
        noticePayload(
          {
            title: "Profile Updated",
            description:
              (updates.length ? updates.join("\n") : "• No modifications made.") +
              `\n\n*Your profile card has been updated successfully.*`,
            emoji: emoji.check || "✅",
            tone: "success",
          },
          true,
        ),
      );
    } catch (err) {
      console.error("[Profile Modal] Error:", err);
      return await interaction.editReply(
        noticePayload(
          {
            title: "Update Failed",
            description: `Failed to update profile: ${err.message}`,
            emoji: emoji.cross || "❌",
            tone: "danger",
          },
          true,
        ),
      );
    }
  },
};
