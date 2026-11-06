const {
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const { TicketConfig, Ticket } = require("../schema");
const config = require("../config");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    // 1. Handle Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.slashExecute(interaction, client);
      } catch (err) {
        console.error(`[Command Error] ${interaction.commandName}:`, err);
        const replyFn = interaction.deferred || interaction.replied ? "editReply" : "reply";
        await interaction[replyFn]({
          content: `❌ Error executing command: ${err.message}`,
          ephemeral: true
        }).catch(() => {});
      }
      return;
    }

    // 2. Handle Ticket Button Interactions
    if (interaction.isButton()) {
      const [namespace, action, category] = interaction.customId.split(":");
      if (namespace !== "ticket") return;

      if (action === "create") {
        await interaction.deferReply({ ephemeral: true });

        // Check if user already has an active open ticket
        const existing = await Ticket.findOne({
          guildId: interaction.guild.id,
          userId: interaction.user.id,
          status: "open"
        });

        if (existing) {
          return interaction.editReply({
            content: `❌ You already have an open ticket in <#${existing.channelId}>!`
          });
        }

        const cfg = await TicketConfig.findOne({ guildId: interaction.guild.id });
        const nextNum = (cfg?.ticketCounter || 0) + 1;

        // Permissions for new ticket channel
        const permissionOverwrites = [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.AttachFiles,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          },
          {
            id: client.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ManageChannels,
              PermissionsBitField.Flags.EmbedLinks
            ]
          }
        ];

        // Add staff role permissions if configured
        if (cfg?.staffRoleId) {
          permissionOverwrites.push({
            id: cfg.staffRoleId,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ]
          });
        }

        const categoryTitles = {
          support: "Bot Help & Playback Support",
          bug: "Bug & Lavalink Issue Report",
          vip: "VIP, Top.gg & Partnership"
        };

        const chosenCategory = categoryTitles[category] || "General Support";
        const channelName = `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, "")}-${nextNum}`;

        const categoryIdToUse = cfg?.categoryId || config.ticketsCategoryId || null;

        const ticketChannel = await interaction.guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: categoryIdToUse,
          permissionOverwrites
        });

        // Record ticket in MongoDB
        await Ticket.create({
          guildId: interaction.guild.id,
          channelId: ticketChannel.id,
          userId: interaction.user.id,
          ticketNumber: nextNum,
          category: chosenCategory,
          status: "open"
        });

        await TicketConfig.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { $inc: { ticketCounter: 1 } },
          { upsert: true }
        );

        // Send Welcome Embed inside the newly created ticket channel
        const welcomeTicketEmbed = new EmbedBuilder()
          .setColor(config.color)
          .setTitle(`📩 Support Ticket #${nextNum}`)
          .setDescription(
            `Hello ${interaction.user.toString()},\n\n` +
            `Thank you for contacting **TOGETHER Support** regarding **${chosenCategory}**.\n\n` +
            `• Please describe your problem in detail.\n` +
            `• If reporting an audio error, mention which voice channel and song URL caused it.\n` +
            `• A staff member will assist you shortly.`
          )
          .setFooter({ text: "Click Close Ticket when your issue has been resolved." })
          .setTimestamp();

        const closeRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket:close")
            .setLabel("Close Ticket")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Danger)
        );

        await ticketChannel.send({
          content: `${interaction.user.toString()} ${cfg?.staffRoleId ? `<@&${cfg.staffRoleId}>` : ""}`,
          embeds: [welcomeTicketEmbed],
          components: [closeRow]
        });

        return interaction.editReply({
          content: `✅ Your ticket has been created! Head over to ${ticketChannel.toString()}.`
        });
      }

      if (action === "close") {
        await interaction.reply({
          content: "🔒 Closing this ticket in 5 seconds...",
          ephemeral: false
        });

        await Ticket.findOneAndUpdate({ channelId: interaction.channel.id }, { status: "closed" });

        setTimeout(async () => {
          try {
            await interaction.channel.delete("Support ticket resolved and closed.");
          } catch {}
        }, 5000);
      }
    }
  }
};
