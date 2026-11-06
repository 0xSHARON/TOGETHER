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

    // 2. Handle Button Interactions
    if (interaction.isButton()) {
      const [namespace, action, extra] = interaction.customId.split(":");

      // Verification Gatekeeper Button
      if (namespace === "verify") {
        const { VerifyConfig } = require("../schema");
        const vcfg = await VerifyConfig.findOne({ guildId: interaction.guild.id, enabled: true });
        if (!vcfg || !vcfg.roleId) {
          return interaction.reply({ content: "Verification role is not configured on this server.", ephemeral: true });
        }
        const role = interaction.guild.roles.cache.get(vcfg.roleId);
        if (!role) {
          return interaction.reply({ content: "The verified member role was deleted or not found.", ephemeral: true });
        }
        if (interaction.member.roles.cache.has(role.id)) {
          return interaction.reply({ content: "You are already verified on this server!", ephemeral: true });
        }
        try {
          await interaction.member.roles.add(role.id, "Verified via Gatekeeper panel");
          return interaction.reply({ content: `✅ Verification successful! Welcome to the server, you now have the **${role.name}** role.`, ephemeral: true });
        } catch (err) {
          return interaction.reply({ content: `Could not grant role: ${err.message}`, ephemeral: true });
        }
      }

      // Giveaway Enter/Leave Button
      if (namespace === "giveaway" && action === "enter") {
        const { Giveaway } = require("../schema");
        const gw = await Giveaway.findOne({ messageId: interaction.message.id, ended: false });
        if (!gw) {
          return interaction.reply({ content: "This giveaway has already ended.", ephemeral: true });
        }
        const userId = interaction.user.id;
        if (gw.entries.includes(userId)) {
          gw.entries = gw.entries.filter(id => id !== userId);
          await gw.save();
          return interaction.reply({ content: "You have left this giveaway.", ephemeral: true });
        } else {
          gw.entries.push(userId);
          await gw.save();
          return interaction.reply({ content: `🎉 You entered the giveaway for **${gw.prize}**! (${gw.entries.length} total entries)`, ephemeral: true });
        }
      }

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
            title: "Archiving Support Ticket",
            description: "Generating complete HTML transcript and archiving channel in 5 seconds...",
            emoji: emoji.lock,
            tone: "danger",
          }, false),
        );

        const ticketDoc = await Ticket.findOneAndUpdate({ channelId: interaction.channel.id }, { status: "closed" });

        let transcriptFile = null;
        try {
          const discordTranscripts = require("discord-html-transcripts");
          transcriptFile = await discordTranscripts.createTranscript(interaction.channel, {
            limit: -1,
            returnType: "attachment",
            filename: `transcript-${interaction.channel.name}.html`,
            saveImages: true,
            poweredBy: false,
          });
        } catch (tErr) {
          console.warn("[Transcript Generation Warning]", tErr.message);
        }

        const closeLog = new EmbedBuilder()
          .setColor("#ED4245")
          .setAuthor({
            name: `${interaction.user.tag} (${interaction.user.id})`,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
          })
          .setTitle(`🔒 Support Ticket Closed`)
          .setDescription(
            `• **Closed By:** ${interaction.user.toString()} (\`${interaction.user.id}\`)\n` +
            `• **Ticket Owner:** ${ticketDoc?.userId ? `<@${ticketDoc.userId}>` : "Unknown"}\n` +
            `• **Channel:** \`${interaction.channel.name}\` (\`${interaction.channel.id}\`)`,
          )
          .setTimestamp();

        // Dispatch log with HTML transcript attachment
        if (transcriptFile) {
          dispatchLogThread(client, "tickets", { embeds: [closeLog], files: [transcriptFile] });
        } else {
          dispatchLogThread(client, "tickets", closeLog);
        }

        // Send transcript to ticket owner's DM
        if (ticketDoc?.userId && transcriptFile) {
          try {
            const owner = await client.users.fetch(ticketDoc.userId).catch(() => null);
            if (owner) {
              await owner.send({
                content: `Your support ticket in **${interaction.guild.name}** was closed. Attached is the full transcript:`,
                files: [transcriptFile]
              });
            }
          } catch {}
        }

        setTimeout(async () => {
          try {
            await interaction.channel.delete("Support ticket resolved and closed.");
          } catch {}
        }, 5000);
      }
    }
  },
};
