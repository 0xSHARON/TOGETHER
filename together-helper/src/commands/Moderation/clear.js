const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const { container, flags, separator, text, noticePayload, COLORS } = require("../../utils/ui");

module.exports = {
  name: "clear",
  aliases: ["purge"],
  description: "Bulk delete messages from the current channel",
  category: "Moderation",
  userPerms: ["ManageMessages"],
  slashOptions: [
    {
      name: "amount",
      description: "Number of messages to delete (1 to 100)",
      type: ApplicationCommandOptionType.Integer,
      required: true,
      min_value: 1,
      max_value: 100
    },
    {
      name: "user",
      description: "Only delete messages sent by this user",
      type: ApplicationCommandOptionType.User,
      required: false
    },
    {
      name: "only_bots",
      description: "Only delete messages from bot accounts",
      type: ApplicationCommandOptionType.Boolean,
      required: false
    }
  ],

  async slashExecute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply(noticePayload({ title: "Permission Denied", description: "You need `Manage Messages` permission.", tone: "danger" }, true));
    }

    const amount = interaction.options.getInteger("amount");
    const targetUser = interaction.options.getUser("user");
    const onlyBots = interaction.options.getBoolean("only_bots");

    await interaction.deferReply({ ephemeral: true });

    try {
      const fetched = await interaction.channel.messages.fetch({ limit: 100 });
      let toDelete = Array.from(fetched.values());

      if (targetUser) {
        toDelete = toDelete.filter(m => m.author.id === targetUser.id);
      } else if (onlyBots) {
        toDelete = toDelete.filter(m => m.author.bot);
      }

      toDelete = toDelete.slice(0, amount);

      const deleted = await interaction.channel.bulkDelete(toDelete, true);

      const card = container(COLORS.success)
        .addTextDisplayComponents(
          text(`### 🧹 Cleaned **${deleted.size}** message(s)\n-# Messages older than 14 days cannot be bulk deleted.`)
        );

      return interaction.editReply({ components: [card], flags: flags(true) });
    } catch (err) {
      return interaction.editReply(noticePayload({ title: "Clear Failed", description: err.message, tone: "danger" }, true));
    }
  },

  async prefixExecute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply(noticePayload({ title: "Permission Denied", description: "You need `Manage Messages` permission.", tone: "danger" }));
    }

    const amount = parseInt(args[0], 10);
    if (!amount || isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply(noticePayload({ title: "Usage", description: "`-clear <1-100> [@user]`\nExample: `-clear 20` or `-clear 50 @user`", tone: "warning" }));
    }

    const targetUser = message.mentions.users.first();

    try {
      await message.delete().catch(() => {});
      const fetched = await message.channel.messages.fetch({ limit: 100 });
      let toDelete = Array.from(fetched.values());

      if (targetUser) {
        toDelete = toDelete.filter(m => m.author.id === targetUser.id);
      }

      toDelete = toDelete.slice(0, amount);
      const deleted = await message.channel.bulkDelete(toDelete, true);

      const card = container(COLORS.success)
        .addTextDisplayComponents(text(`### 🧹 Cleaned **${deleted.size}** message(s)`));

      return message.channel.send({ components: [card], flags: flags(false) })
        .then(m => setTimeout(() => m.delete().catch(() => {}), 4000));
    } catch (err) {
      return message.channel.send(noticePayload({ title: "Clear Failed", description: err.message, tone: "danger" }));
    }
  }
};
