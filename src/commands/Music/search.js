const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  PermissionsBitField
} = require("discord.js");
const config = require("../../config");
const { convertTime } = require("../../utils/convert");
const { hasAvailableNodes } = require("../../utils/nodeUtils");

function truncate(str, max = 80) {
  if (!str) return "Unknown";
  return str.length > max ? `${str.slice(0, max - 3)}...` : str;
}

module.exports = {
  name: "search",
  category: "Music",
  aliases: ["find"],
  cooldown: 5,
  description: "Search for a song and pick from the top results.",
  args: true,
  usage: "<song name>",
  inVoiceChannel: true,
  sameVoiceChannel: true,
  botPerms: ["EmbedLinks", "Connect", "Speak"],

  slashOptions: [
    {
      name: "query",
      description: "The song or artist you want to search for",
      type: 3,
      required: true,
      autocomplete: false
    }
  ],

  async slashExecute(interaction, client) {
    const query = interaction.options.getString("query");

    if (!interaction.member?.voice?.channel) {
      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.warn || "⚠️"} You need to be in a voice channel first.**`);
      const container = new ContainerBuilder().addTextDisplayComponents(errorDisplay);
      return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
    }

    const channel = interaction.member.voice.channel;
    const permissions = channel.permissionsFor(interaction.guild.members.me);
    if (!permissions.has(PermissionsBitField.Flags.Connect) || !permissions.has(PermissionsBitField.Flags.Speak)) {
      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.warn || "⚠️"} I need \`CONNECT\` and \`SPEAK\` permissions in your voice channel.**`);
      const container = new ContainerBuilder().addTextDisplayComponents(errorDisplay);
      return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
    }

    let player = client.manager.players.get(interaction.guild.id);
    if (player && player.voiceId !== channel.id) {
      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.warn || "⚠️"} I'm already connected to a different voice channel.**`);
      const container = new ContainerBuilder().addTextDisplayComponents(errorDisplay);
      return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral });
    }

    if (!hasAvailableNodes(client.manager)) {
      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.cross || "❌"} The music server is currently unavailable. Please try again later.**`);
      const container = new ContainerBuilder().addTextDisplayComponents(errorDisplay);
      return interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    await interaction.deferReply();

    let res;
    try {
      res = await client.manager.search(query, {
        requester: interaction.user,
        engine: config.node_source || "scsearch"
      });
    } catch (err) {
      console.error("[Search Command] Search error:", err);
      const errDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.cross || "❌"} An error occurred while searching for tracks.**`);
      const errContainer = new ContainerBuilder().addTextDisplayComponents(errDisplay);
      return interaction.editReply({ components: [errContainer], flags: MessageFlags.IsComponentsV2 });
    }

    if (!res || !res.tracks || !res.tracks.length) {
      const emptyDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.cross || "❌"} No results found for \`${truncate(query, 50)}\`.**`);
      const emptyContainer = new ContainerBuilder().addTextDisplayComponents(emptyDisplay);
      return interaction.editReply({ components: [emptyContainer], flags: MessageFlags.IsComponentsV2 });
    }

    const tracks = res.tracks.slice(0, 10);

    const menuOptions = tracks.map((track, i) => ({
      label: `${i + 1}. ${truncate(track.title, 80)}`,
      description: `${truncate(track.author, 40)} • ${convertTime(track.length)}`,
      value: `${i}`
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("search_select")
      .setPlaceholder("Select a track to add to queue...")
      .addOptions(menuOptions);

    const cancelBtn = new ButtonBuilder()
      .setCustomId("search_cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary);

    const trackListText = tracks
      .map((t, idx) => `\`${idx + 1}.\` [${truncate(t.title, 45)}](${t.uri}) — \`${convertTime(t.length)}\` by **${truncate(t.author, 25)}**`)
      .join("\n");

    const headerDisplay = new TextDisplayBuilder()
      .setContent(`**${client.emoji.search || "🔍"} Search Results for:** \`${truncate(query, 50)}\``);
    const listDisplay = new TextDisplayBuilder()
      .setContent(trackListText);
    const promptDisplay = new TextDisplayBuilder()
      .setContent(`Select a song from the dropdown menu below within 60 seconds.`);

    const menuRow = new ActionRowBuilder().addComponents(selectMenu);
    const btnRow = new ActionRowBuilder().addComponents(cancelBtn);

    const container = new ContainerBuilder()
      .addTextDisplayComponents(headerDisplay)
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents(listDisplay)
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents(promptDisplay)
      .addActionRowComponents(menuRow)
      .addActionRowComponents(btnRow);

    const replyMsg = await interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });

    const collector = replyMsg.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 60000,
      max: 1
    });

    collector.on("collect", async (i) => {
      if (i.customId === "search_cancel") {
        await i.deferUpdate();
        const cancelDisplay = new TextDisplayBuilder()
          .setContent(`**${client.emoji.cross || "❌"} Search cancelled.**`);
        const cancelContainer = new ContainerBuilder().addTextDisplayComponents(cancelDisplay);
        return interaction.editReply({ components: [cancelContainer], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
      }

      if (i.customId === "search_select") {
        await i.deferUpdate();
        const selectedIndex = parseInt(i.values[0], 10);
        const selectedTrack = tracks[selectedIndex];

        if (!selectedTrack) {
          const failDisplay = new TextDisplayBuilder()
            .setContent(`**${client.emoji.cross || "❌"} Selected track is invalid.**`);
          const failContainer = new ContainerBuilder().addTextDisplayComponents(failDisplay);
          return interaction.editReply({ components: [failContainer], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
        }

        try {
          if (!player) {
            player = await client.manager.createPlayer({
              guildId: interaction.guild.id,
              voiceId: channel.id,
              textId: interaction.channel.id,
              volume: 80,
              deaf: true
            });
          }

          if (!selectedTrack.requester) selectedTrack.requester = interaction.user;
          player.data.set("lastRequester", interaction.user);
          player.queue.add(selectedTrack);

          if (!player.playing && !player.paused) {
            await player.play();
          }

          const successDisplay = new TextDisplayBuilder()
            .setContent(
              `**${client.emoji.check || "✅"} Added to Queue:** [${truncate(selectedTrack.title, 60)}](${selectedTrack.uri})\n` +
              `> **Author:** ${truncate(selectedTrack.author, 40)}\n` +
              `> **Duration:** \`${convertTime(selectedTrack.length)}\`\n` +
              `> **Position in Queue:** \`${player.queue.length}\``
            );
          const successContainer = new ContainerBuilder().addTextDisplayComponents(successDisplay);

          await interaction.editReply({ components: [successContainer], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
        } catch (queueErr) {
          console.error("[Search Command] Queue error:", queueErr);
          const errDisplay = new TextDisplayBuilder()
            .setContent(`**${client.emoji.cross || "❌"} Failed to play track: ${queueErr.message}**`);
          const errContainer = new ContainerBuilder().addTextDisplayComponents(errDisplay);
          await interaction.editReply({ components: [errContainer], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
        }
      }
    });

    collector.on("end", async (collected, reason) => {
      if (reason === "time") {
        const timeoutDisplay = new TextDisplayBuilder()
          .setContent(`**${client.emoji.warn || "⚠️"} Search selection timed out.**`);
        const timeoutContainer = new ContainerBuilder().addTextDisplayComponents(timeoutDisplay);
        await interaction.editReply({ components: [timeoutContainer], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
      }
    });
  },

  async execute(message, args, client, prefix) {
    if (!args.length) {
      const usageDisplay = new TextDisplayBuilder()
        .setContent(
          `**${client.emoji.dot || "•"} Usage:** \`${prefix}search <song name/query>\`\n` +
          `**${client.emoji.dot || "•"} Example:** \`${prefix}search believer\``
        );
      const container = new ContainerBuilder().addTextDisplayComponents(usageDisplay);
      return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    const query = args.join(" ");

    if (!message.member?.voice?.channel) {
      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.warn || "⚠️"} You need to be in a voice channel first.**`);
      const container = new ContainerBuilder().addTextDisplayComponents(errorDisplay);
      return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    const channel = message.member.voice.channel;
    const permissions = channel.permissionsFor(message.guild.members.me);
    if (!permissions.has(PermissionsBitField.Flags.Connect) || !permissions.has(PermissionsBitField.Flags.Speak)) {
      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.warn || "⚠️"} I need \`CONNECT\` and \`SPEAK\` permissions in your voice channel.**`);
      const container = new ContainerBuilder().addTextDisplayComponents(errorDisplay);
      return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    let player = client.manager.players.get(message.guild.id);
    if (player && player.voiceId !== channel.id) {
      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.warn || "⚠️"} I'm already connected to a different voice channel.**`);
      const container = new ContainerBuilder().addTextDisplayComponents(errorDisplay);
      return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    if (!hasAvailableNodes(client.manager)) {
      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.cross || "❌"} The music server is currently unavailable. Please try again later.**`);
      const container = new ContainerBuilder().addTextDisplayComponents(errorDisplay);
      return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    const loadDisplay = new TextDisplayBuilder()
      .setContent(`**${client.emoji.search || "🔍"} Searching for \`${truncate(query, 50)}\`...**`);
    const loadContainer = new ContainerBuilder().addTextDisplayComponents(loadDisplay);
    const sentMsg = await message.reply({ components: [loadContainer], flags: MessageFlags.IsComponentsV2 });

    let res;
    try {
      res = await client.manager.search(query, {
        requester: message.author,
        engine: config.node_source || "scsearch"
      });
    } catch (err) {
      console.error("[Search Command] Search error:", err);
      const errDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.cross || "❌"} An error occurred while searching for tracks.**`);
      const errContainer = new ContainerBuilder().addTextDisplayComponents(errDisplay);
      return sentMsg.edit({ components: [errContainer], flags: MessageFlags.IsComponentsV2 });
    }

    if (!res || !res.tracks || !res.tracks.length) {
      const emptyDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.cross || "❌"} No results found for \`${truncate(query, 50)}\`.**`);
      const emptyContainer = new ContainerBuilder().addTextDisplayComponents(emptyDisplay);
      return sentMsg.edit({ components: [emptyContainer], flags: MessageFlags.IsComponentsV2 });
    }

    const tracks = res.tracks.slice(0, 10);

    const menuOptions = tracks.map((track, i) => ({
      label: `${i + 1}. ${truncate(track.title, 80)}`,
      description: `${truncate(track.author, 40)} • ${convertTime(track.length)}`,
      value: `${i}`
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("search_select")
      .setPlaceholder("Select a track to add to queue...")
      .addOptions(menuOptions);

    const cancelBtn = new ButtonBuilder()
      .setCustomId("search_cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary);

    const trackListText = tracks
      .map((t, idx) => `\`${idx + 1}.\` [${truncate(t.title, 45)}](${t.uri}) — \`${convertTime(t.length)}\` by **${truncate(t.author, 25)}**`)
      .join("\n");

    const headerDisplay = new TextDisplayBuilder()
      .setContent(`**${client.emoji.search || "🔍"} Search Results for:** \`${truncate(query, 50)}\``);
    const listDisplay = new TextDisplayBuilder()
      .setContent(trackListText);
    const promptDisplay = new TextDisplayBuilder()
      .setContent(`Select a song from the dropdown menu below within 60 seconds.`);

    const menuRow = new ActionRowBuilder().addComponents(selectMenu);
    const btnRow = new ActionRowBuilder().addComponents(cancelBtn);

    const container = new ContainerBuilder()
      .addTextDisplayComponents(headerDisplay)
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents(listDisplay)
      .addSeparatorComponents(new SeparatorBuilder())
      .addTextDisplayComponents(promptDisplay)
      .addActionRowComponents(menuRow)
      .addActionRowComponents(btnRow);

    await sentMsg.edit({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });

    const collector = sentMsg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 60000,
      max: 1
    });

    collector.on("collect", async (i) => {
      if (i.customId === "search_cancel") {
        await i.deferUpdate();
        const cancelDisplay = new TextDisplayBuilder()
          .setContent(`**${client.emoji.cross || "❌"} Search cancelled.**`);
        const cancelContainer = new ContainerBuilder().addTextDisplayComponents(cancelDisplay);
        return sentMsg.edit({ components: [cancelContainer], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
      }

      if (i.customId === "search_select") {
        await i.deferUpdate();
        const selectedIndex = parseInt(i.values[0], 10);
        const selectedTrack = tracks[selectedIndex];

        if (!selectedTrack) {
          const failDisplay = new TextDisplayBuilder()
            .setContent(`**${client.emoji.cross || "❌"} Selected track is invalid.**`);
          const failContainer = new ContainerBuilder().addTextDisplayComponents(failDisplay);
          return sentMsg.edit({ components: [failContainer], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
        }

        try {
          if (!player) {
            player = await client.manager.createPlayer({
              guildId: message.guild.id,
              voiceId: channel.id,
              textId: message.channel.id,
              volume: 80,
              deaf: true
            });
          }

          if (!selectedTrack.requester) selectedTrack.requester = message.author;
          player.data.set("lastRequester", message.author);
          player.queue.add(selectedTrack);

          if (!player.playing && !player.paused) {
            await player.play();
          }

          const successDisplay = new TextDisplayBuilder()
            .setContent(
              `**${client.emoji.check || "✅"} Added to Queue:** [${truncate(selectedTrack.title, 60)}](${selectedTrack.uri})\n` +
              `> **Author:** ${truncate(selectedTrack.author, 40)}\n` +
              `> **Duration:** \`${convertTime(selectedTrack.length)}\`\n` +
              `> **Position in Queue:** \`${player.queue.length}\``
            );
          const successContainer = new ContainerBuilder().addTextDisplayComponents(successDisplay);

          await sentMsg.edit({ components: [successContainer], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
        } catch (queueErr) {
          console.error("[Search Command] Queue error:", queueErr);
          const errDisplay = new TextDisplayBuilder()
            .setContent(`**${client.emoji.cross || "❌"} Failed to play track: ${queueErr.message}**`);
          const errContainer = new ContainerBuilder().addTextDisplayComponents(errDisplay);
          await sentMsg.edit({ components: [errContainer], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
        }
      }
    });

    collector.on("end", async (collected, reason) => {
      if (reason === "time") {
        const timeoutDisplay = new TextDisplayBuilder()
          .setContent(`**${client.emoji.warn || "⚠️"} Search selection timed out.**`);
        const timeoutContainer = new ContainerBuilder().addTextDisplayComponents(timeoutDisplay);
        await sentMsg.edit({ components: [timeoutContainer], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
      }
    });
  }
};
