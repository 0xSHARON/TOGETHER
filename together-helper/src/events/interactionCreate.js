const {
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");
const { TicketConfig, Ticket } = require("../schema");
const config = require("../config");
const {
  container,
  separator,
  text,
  flags,
  noticePayload,
  COLORS
} = require("../utils/ui");

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
        if (client.logger) {
          client.logger.error(`[Command Error] /${interaction.commandName}: ${err.stack || err.message}`);
        }
        const replyFn = interaction.deferred || interaction.replied ? "editReply" : "reply";
        await interaction[replyFn](
          noticePayload({
            title: "Command Execution Error",
            description: `An error occurred while executing \`/${interaction.commandName}\`:\n\`\`\`${err.message}\`\`\``,
            emoji: "⚠️",
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
              description: `You already have an active ticket in <#${existing.channelId}>! Please resolve it before opening another.`,
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

        // Send Components V2 Welcome Card inside the newly created ticket channel
        const ticketCard = container(COLORS.brand)
          .addTextDisplayComponents(
            text(`## 📩 Support Ticket #${nextNum}\n*Category: ${chosenCategory}*`)
          )
          .addSeparatorComponents(separator())
          .addTextDisplayComponents(
            text(
              `Hello ${interaction.user.toString()},\n\n` +
              `Thank you for reaching out to **TOGETHER Support**.\n\n` +
              `• **Detail:** Please describe your inquiry or audio problem below.\n` +
              `• **Context:** If reporting an audio lag or error, include the voice channel name and track link.\n` +
              `• **Assistance:** A staff member will respond shortly.`
            )
          )
          .addSeparatorComponents(separator())
          .addActionRowComponents(
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("ticket:close")
                .setLabel("Close Ticket")
                .setEmoji("🔒")
                .setStyle(ButtonStyle.Danger)
            )
          );

        await ticketChannel.send({
          content: `${interaction.user.toString()} ${cfg?.staffRoleId ? `<@&${cfg.staffRoleId}>` : ""}`,
          components: [ticketCard],
          flags: flags(false)
        });

        return interaction.editReply(
          noticePayload({
            title: "Support Ticket Created",
            description: `Your ticket has been generated at ${ticketChannel.toString()}. Click to jump right in!`,
            emoji: "🎫",
            tone: "success"
          }, true)
        );
      }

      if (action === "close") {
        const closeNotice = container(COLORS.danger)
          .addTextDisplayComponents(text("### 🔒 Closing Ticket\nThis channel will be deleted in 5 seconds..."));

        await interaction.reply({
          components: [closeNotice],
          flags: flags(false)
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
