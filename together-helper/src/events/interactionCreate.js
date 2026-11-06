const {
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const { TicketConfig, Ticket } = require("../schema");
const config = require("../config");
const { container, flags, noticePayload, separator, text } = require("../utils/ui");
const { dispatchLogThread } = require("../utils/webhooks");
const emoji = require("../emojis");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    // 1. Handle Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.slashExecute(interaction, client);

        const cmdEmbed = new EmbedBuilder()
          .setColor("#00E676")
          .setAuthor({
            name: `${interaction.user.tag} (${interaction.user.id})`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setTitle("📜 Slash Command Executed")
          .setDescription(`• **Command:** \`/${interaction.commandName}\`\n• **Channel:** <#${interaction.channel.id}>\n• **Server:** \`${interaction.guild?.name}\``)
          .setTimestamp();
        dispatchLogThread(client, "cmdrun", cmdEmbed);
      } catch (err) {
        console.error(`[Command Error] ${interaction.commandName}:`, err);
        const replyFn = interaction.deferred || interaction.replied ? "editReply" : "reply";
        await interaction[replyFn](
          noticePayload({
            title: "Command Execution Error",
            description: err.message,
            emoji: emoji.cross,
            tone: "danger",
          }, true),
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
          status: "open",
        });

        if (existing) {
          return interaction.editReply(
            noticePayload({
              title: "Ticket Already Open",
              description: `You already have an active ticket open in <#${existing.channelId}>. Please resolve it before creating a new one.`,
              emoji: emoji.warn,
              tone: "warning",
            }, true),
          );
        }

        const cfg = await TicketConfig.findOne({ guildId: interaction.guild.id });
        const nextNum = (cfg?.ticketCounter || 0) + 1;

        // Permissions for new ticket channel
        const permissionOverwrites = [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.AttachFiles,
              PermissionsBitField.Flags.ReadMessageHistory,
            ],
          },
          {
            id: client.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ManageChannels,
              PermissionsBitField.Flags.EmbedLinks,
            ],
          },
        ];

        // Add staff role permissions if configured
        if (cfg?.staffRoleId) {
          permissionOverwrites.push({
            id: cfg.staffRoleId,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory,
            ],
          });
        }

        const categoryTitles = {
          support: "Bot Help & Playback Support",
          bug: "Bug & Lavalink Issue Report",
          vip: "VIP, Top.gg & Partnership",
        };

        const chosenCategory = categoryTitles[category] || "General Support";
        const channelName = `ticket-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, "")}-${nextNum}`;
        const categoryIdToUse = cfg?.categoryId || config.ticketsCategoryId || null;

        const ticketChannel = await interaction.guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: categoryIdToUse,
          permissionOverwrites,
        });

        // Record ticket in MongoDB
        await Ticket.create({
          guildId: interaction.guild.id,
          channelId: ticketChannel.id,
          userId: interaction.user.id,
          ticketNumber: nextNum,
          category: chosenCategory,
          status: "open",
        });

        await TicketConfig.findOneAndUpdate(
          { guildId: interaction.guild.id },
          { $inc: { ticketCounter: 1 } },
          { upsert: true },
        );

        const closeRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket:close")
            .setLabel("Close Ticket")
            .setEmoji(emoji.lock || "🔒")
            .setStyle(ButtonStyle.Danger),
        );

        // Send Components V2 Card inside the newly created ticket channel
        const welcomeCard = container()
          .addTextDisplayComponents(text(`## 📩 Support Room #${nextNum}\n-# Category: ${chosenCategory}`))
          .addSeparatorComponents(separator())
          .addTextDisplayComponents(
            text(
              `Hello ${interaction.user.toString()},\n\n` +
              `Thank you for contacting **TOGETHER Support** regarding **${chosenCategory}**.\n\n` +
              `• **Instructions**  Provide all details, URLs, or screenshots relating to your question.\n` +
              `• **Assistance**    A support staff member has been notified and will assist you shortly.\n` +
              `• **Resolution**    Click **Close Ticket** below when your issue is resolved.`,
            ),
          )
          .addSeparatorComponents(separator())
          .addTextDisplayComponents(text(`-# TOGETHER Helper · Support Desk`))
          .addActionRowComponents(closeRow);

        const staffPing = cfg?.staffRoleId ? `<@&${cfg.staffRoleId}>` : "";
        await ticketChannel.send({
          content: `${interaction.user.toString()} ${staffPing}`.trim(),
          components: [welcomeCard],
          flags: flags(false),
        });

        const ticketLog = new EmbedBuilder()
          .setColor("#00E676")
          .setAuthor({
            name: `${interaction.user.tag} (${interaction.user.id})`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setTitle(`📩 Support Ticket #${nextNum} Opened`)
          .setDescription(
            `• **Author:** ${interaction.user.toString()} (\`${interaction.user.id}\`)\n` +
            `• **Category:** \`${chosenCategory}\`\n` +
            `• **Channel:** <#${ticketChannel.id}> (\`${ticketChannel.id}\`)`,
          )
          .setTimestamp();
        dispatchLogThread(client, "tickets", ticketLog);

        return interaction.editReply(
          noticePayload({
            title: "Support Ticket Created",
            description: `Your ticket has been opened: <#${ticketChannel.id}>. Click the link to jump directly to your support room.`,
            emoji: emoji.check,
            tone: "success",
          }, true),
        );
      }

      if (action === "close") {
        await interaction.reply(
          noticePayload({
            title: "Closing Support Ticket",
            description: "This channel will be closed and archived in 5 seconds. Thank you!",
            emoji: emoji.lock,
            tone: "danger",
          }, false),
        );

        await Ticket.findOneAndUpdate({ channelId: interaction.channel.id }, { status: "closed" });

        const closeLog = new EmbedBuilder()
          .setColor("#ED4245")
          .setAuthor({
            name: `${interaction.user.tag} (${interaction.user.id})`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setTitle(`🔒 Support Ticket Closed`)
          .setDescription(
            `• **Closed By:** ${interaction.user.toString()} (\`${interaction.user.id}\`)\n` +
            `• **Channel:** \`${interaction.channel.name}\` (\`${interaction.channel.id}\`)`,
          )
          .setTimestamp();
        dispatchLogThread(client, "tickets", closeLog);

        setTimeout(async () => {
          try {
            await interaction.channel.delete("Support ticket resolved and closed.");
          } catch {}
        }, 5000);
      }
    }
  },
};
