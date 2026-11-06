const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
  PermissionFlagsBits
} = require("discord.js");
const { VerifyConfig } = require("../../schema");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");

module.exports = {
  name: "verify",
  description: "Deploy a server gatekeeper verification panel with an interactive button",
  category: "Admin",
  userPerms: ["ManageGuild"],
  slashOptions: [
    {
      name: "role",
      description: "The role granted when a user clicks Verify",
      type: ApplicationCommandOptionType.Role,
      required: true
    },
    {
      name: "channel",
      description: "Channel to post the verification panel (defaults to current channel)",
      type: ApplicationCommandOptionType.Channel,
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply(noticePayload({ title: "Permission Denied", description: "You need `Manage Server` permission.", tone: "danger" }, true));
    }

    const role = interaction.options.getRole("role");
    const channel = interaction.options.getChannel("channel") || interaction.channel;

    await VerifyConfig.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { roleId: role.id, channelId: channel.id, enabled: true },
      { upsert: true, new: true }
    );

    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("verify:role")
        .setLabel("Verify & Access Server")
        .setEmoji("🛡️")
        .setStyle(ButtonStyle.Success)
    );

    const panelCard = container(COLORS.info)
      .addTextDisplayComponents(
        text(`## 🛡️ Welcome to ${interaction.guild.name}\n-# Member Verification & Security Check`)
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(
        text(
          `To gain access to channels and protect the community from spam bots, click the **Verify** button below.\n\n` +
          `• By clicking verify, you agree to follow the server guidelines and Discord Terms of Service.\n` +
          `• You will automatically receive the <@&${role.id}> role.`
        )
      )
      .addSeparatorComponents(separator())
      .addTextDisplayComponents(text(`-# TOGETHER Helper · Community Security Gatekeeper`))
      .addActionRowComponents(buttonRow);

    await channel.send({ components: [panelCard], flags: flags(false) });

    return interaction.reply(
      noticePayload({
        title: "Verification Panel Deployed",
        description: `Successfully posted the verification panel in <#${channel.id}>! Granting role: <@&${role.id}>.`,
        tone: "success"
      }, true)
    );
  },

  async prefixExecute(message, args, client) {
    return message.reply(noticePayload({
      title: "Gatekeeper Verification",
      description: "Please run `/verify role: @Role` to deploy the interactive verification panel.",
      tone: "info"
    }));
  }
};
