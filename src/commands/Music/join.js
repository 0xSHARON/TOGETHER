const {
  MessageFlags,
  PermissionsBitField,
  ContainerBuilder,
  TextDisplayBuilder,
  ChannelType
} = require("discord.js");
const emoji = require("../../emojis");

module.exports = {
  name: "join",
  aliases: ["j"],
  category: "Music",
  cooldown: 3,
  description: "Join voice channel",
  args: false,
  usage: "",
  userPerms: [],
  botPerms: ["EmbedLinks"],
  owner: false,
  player: false,
  inVoiceChannel: true,
  sameVoiceChannel: false,
  slashOptions: [],

  async slashExecute(interaction, client) {
    if (!interaction.member.voice.channel) {
      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.warn} You must be in a voice channel to use this command.**`);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorDisplay);

      return interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const { channel } = interaction.member.voice;
    const player = client.manager.players.get(interaction.guild.id);

    if (player) {
      const warnDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.warn} I'm already connected to <#${player.voiceId}>**`);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(warnDisplay);

      return interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const isStage = channel.type === ChannelType.GuildStageVoice;
    const botMember = interaction.guild.members.me;
    const channelPerms = channel.permissionsFor(botMember) || botMember?.permissions;

    const hasPerms = isStage
      ? channelPerms?.has([PermissionsBitField.Flags.Connect])
      : channelPerms?.has([PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak]);

    if (!hasPerms) {
      const needed = isStage ? "`CONNECT`" : "`CONNECT` or `SPEAK`";
      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.warn} I don't have enough permissions to execute this command! Please give me permission ${needed}.**`);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorDisplay);

      return interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }

    await client.manager.createPlayer({
      guildId: interaction.guild.id,
      voiceId: interaction.member.voice.channel.id,
      textId: interaction.channel.id,
      volume: 100,
      deaf: !isStage,
      mute: false,
    });

    const successDisplay = new TextDisplayBuilder()
      .setContent(`**${client.emoji.check} Joined <#${channel.id}> and bound to <#${interaction.channel.id}>**`);

    const container = new ContainerBuilder()
      .addTextDisplayComponents(successDisplay);

    return interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  },

  async execute(message, args, client, prefix) {
    const textPerms = message.channel.permissionsFor?.(message.guild.members.me) ||
      (message.guild.members.me.permissionsIn ? message.guild.members.me.permissionsIn(message.channel) : null);
    if (textPerms && !textPerms.has(PermissionsBitField.Flags.SendMessages)) {
      try {
        await message.author.send({
          content: `I don't have permission to send messages in <#${message.channel.id}> in **${message.guild.name}**`
        });
      } catch (e) { }
      return;
    }

    const { channel } = message.member.voice;
    const player = client.manager.players.get(message.guild.id);

    if (player) {
      const warnDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.warn} I'm already connected to <#${player.voiceId}>**`);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(warnDisplay);

      return await message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const isStage = channel.type === ChannelType.GuildStageVoice;
    const botMember = message.guild.members.me;
    const channelPerms = channel.permissionsFor(botMember) || botMember?.permissions;

    const hasPerms = isStage
      ? channelPerms?.has([PermissionsBitField.Flags.Connect])
      : channelPerms?.has([PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak]);

    if (!hasPerms) {
      const needed = isStage ? "`CONNECT`" : "`CONNECT` or `SPEAK`";
      const errorDisplay = new TextDisplayBuilder()
        .setContent(
          `**${client.emoji.warn} I don't have enough permissions to execute this command! Please give me permission ${needed}.**`
        );

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorDisplay);

      return message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }

    await client.manager.createPlayer({
      guildId: message.guild.id,
      voiceId: message.member.voice.channel.id,
      textId: message.channel.id,
      volume: 100,
      deaf: !isStage,
      mute: false,
    });

    const successDisplay = new TextDisplayBuilder()
      .setContent(
        `**${client.emoji.check} Joined <#${channel.id}> and bound to <#${message.channel.id}>**`
      );

    const container = new ContainerBuilder()
      .addTextDisplayComponents(successDisplay);

    return message.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  },
};

