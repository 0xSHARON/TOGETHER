const {
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const { TicketConfig, Ticket } = require("../schema");
const config = require("../config");
const { container, flags, noticePayload, separator, text, COLORS } = require("../utils/ui");

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
        await interaction[replyFn](
          noticePayload({
            title: "Command Execution Error",
            description: err.message,
            emoji: "❌",
            tone: "danger"
          }, true)
        ).catch(() => {});
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
          return interaction.editReply(
            noticePayload({
              title: "Ticket Already Open",
              description: `You already have an active ticket open in <#${existing.channelId}>. Please resolve it before creating a new one.`,
              emoji: "⚠️",
              tone: "warning"
            }, true)
          );
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

        // Send Components V2 Card inside the newly created ticket channel
        const welcomeCard = container(COLORS.brand)
          .addTextDisplayComponents(text(`### 📩 Support Room #${nextNum} • ${chosenCategory}`))
          .addSeparatorComponents(separator())
          .addTextDisplayComponents(
            text(
              `Hello ${interaction.user.toString()},\n\n` +
              `Thank you for contacting **TOGETHER Support** regarding **${chosenCategory}**.\n\n` +
              `• **Instructions:** Describe your issue clearly, providing links or reproduction steps where applicable.\n` +
              `• **Staff Response:** A support team member has been notified and will assist you shortly.\n` +
              `• **Resolution:** When finished, click **Close Ticket** below to archive this room.`
            )
          )
          .addSeparatorComponents(separator())
          .addTextDisplayComponents(text(`*TOGETHER Helper • Support Desk Automation*`));

        const closeRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket:close")
            .setLabel("Close Ticket")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Danger)
        );

        const staffPing = cfg?.staffRoleId ? `<@&${cfg.staffRoleId}>` : "";
        await ticketChannel.send({
          content: `${interaction.user.toString()} ${staffPing}`.trim(),
          components: [welcomeCard, closeRow],
          flags: flags(false)
        });

        return interaction.editReply(
          noticePayload({
            title: "Support Ticket Created",
            description: `Your ticket has been opened: <#${ticketChannel.id}>. Click the link to jump directly to your support room.`,
            emoji: "✅",
            tone: "success"
          }, true)
        );
      }

      if (action === "close") {
        await interaction.reply(
          noticePayload({
            title: "Closing Support Ticket",
            description: "This channel will be closed and deleted in 5 seconds. Thank you!",
            emoji: "🔒",
            tone: "danger"
          }, false)
        );

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
