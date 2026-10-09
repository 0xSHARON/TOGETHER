const {
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder
} = require("discord.js");
const Blacklist = require("../../schema/blacklist");

module.exports = {
  name: "blacklist",
  aliases: ["bl", "block"],
  category: "Owner",
  description: "Blacklist or unblacklist a user from using the bot.",
  args: false,
  usage: "<add/remove/list> <@user/ID>",
  owner: true,

  slashOptions: [
    {
      name: "add",
      description: "Blacklist a user",
      type: 1,
      options: [
        {
          name: "user",
          description: "The user to blacklist",
          type: 6,
          required: true
        }
      ]
    },
    {
      name: "remove",
      description: "Remove a user from blacklist",
      type: 1,
      options: [
        {
          name: "user",
          description: "The user to unblacklist",
          type: 6,
          required: true
        }
      ]
    },
    {
      name: "list",
      description: "List all blacklisted users",
      type: 1,
      options: []
    }
  ],

  async slashExecute(interaction, client) {
    const owners = client.owners || client.config?.ownerID || [];
    if (!owners.includes(interaction.user.id)) {
      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji?.warn || "⚠️"} Only bot owners can use this command.**`);
      return interaction.reply({
        components: [new ContainerBuilder().addTextDisplayComponents(errorDisplay)],
        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2
      });
    }

    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser("user");
    const args = [sub];
    if (user) args.push(user.id);

    const wrapper = {
      guild: interaction.guild,
      channel: interaction.channel,
      author: interaction.user,
      member: interaction.member,
      reply: async (opts) => {
        if (interaction.deferred || interaction.replied) return interaction.editReply(opts);
        return interaction.reply(opts);
      }
    };

    return this.execute(wrapper, args, client, client.prefix || ".");
  },

  async execute(message, args, client, prefix) {
    const owners = client.owners || client.config?.ownerID || [];
    if (!owners.includes(message.author.id)) {
      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji?.warn || "⚠️"} Only bot owners can use this command.**`);
      return message.reply({
        components: [new ContainerBuilder().addTextDisplayComponents(errorDisplay)],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const sub = (args[0] || "").toLowerCase();

    if (sub === "add") {
      const targetId = message.mentions?.users?.first()?.id || args[1];
      if (!targetId) {
        const display = new TextDisplayBuilder()
          .setContent(`**${client.emoji?.warn || "⚠️"} Usage:** \`${prefix}blacklist add <@user/ID>\``);
        return message.reply({
          components: [new ContainerBuilder().addTextDisplayComponents(display)],
          flags: MessageFlags.IsComponentsV2
        });
      }

      if (owners.includes(targetId)) {
        const display = new TextDisplayBuilder()
          .setContent(`**${client.emoji?.cross || "❌"} You cannot blacklist a bot owner.**`);
        return message.reply({
          components: [new ContainerBuilder().addTextDisplayComponents(display)],
          flags: MessageFlags.IsComponentsV2
        });
      }

      const existing = await Blacklist.findOne({ userId: targetId });
      if (existing) {
        const display = new TextDisplayBuilder()
          .setContent(`**${client.emoji?.warn || "⚠️"} <@${targetId}> is already blacklisted.**`);
        return message.reply({
          components: [new ContainerBuilder().addTextDisplayComponents(display)],
          flags: MessageFlags.IsComponentsV2
        });
      }

      await Blacklist.create({ userId: targetId });

      const display = new TextDisplayBuilder()
        .setContent(`**${client.emoji?.check || "✅"} Successfully blacklisted <@${targetId}> (\`${targetId}\`).**`);
      return message.reply({
        components: [new ContainerBuilder().addTextDisplayComponents(display)],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (sub === "remove" || sub === "delete") {
      const targetId = message.mentions?.users?.first()?.id || args[1];
      if (!targetId) {
        const display = new TextDisplayBuilder()
          .setContent(`**${client.emoji?.warn || "⚠️"} Usage:** \`${prefix}blacklist remove <@user/ID>\``);
        return message.reply({
          components: [new ContainerBuilder().addTextDisplayComponents(display)],
          flags: MessageFlags.IsComponentsV2
        });
      }

      const existing = await Blacklist.findOneAndDelete({ userId: targetId });
      if (!existing) {
        const display = new TextDisplayBuilder()
          .setContent(`**${client.emoji?.warn || "⚠️"} <@${targetId}> is not currently blacklisted.**`);
        return message.reply({
          components: [new ContainerBuilder().addTextDisplayComponents(display)],
          flags: MessageFlags.IsComponentsV2
        });
      }

      const display = new TextDisplayBuilder()
        .setContent(`**${client.emoji?.check || "✅"} Successfully removed <@${targetId}> (\`${targetId}\`) from blacklist.**`);
      return message.reply({
        components: [new ContainerBuilder().addTextDisplayComponents(display)],
        flags: MessageFlags.IsComponentsV2
      });
    }

    if (sub === "list") {
      const list = await Blacklist.find({}).sort({ timestamp: -1 }).limit(25);
      if (!list.length) {
        const display = new TextDisplayBuilder()
          .setContent(`**${client.emoji?.info || "ℹ️"} No users are currently blacklisted.**`);
        return message.reply({
          components: [new ContainerBuilder().addTextDisplayComponents(display)],
          flags: MessageFlags.IsComponentsV2
        });
      }

      const lines = list.map((doc, idx) => `\`${String(idx + 1).padStart(2, "0")}.\` <@${doc.userId}> (\`${doc.userId}\`)`);
      const container = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${client.emoji?.warn || "⚠️"} Blacklisted Users (${list.length})`)
        )
        .addSeparatorComponents(new SeparatorBuilder())
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(lines.join("\n"))
        );

      return message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const helpDisplay = new TextDisplayBuilder()
      .setContent(
        `## ${client.emoji?.info || "ℹ️"} Blacklist Management\n\n` +
        `**${client.emoji?.dot || "•"} Add User:** \`${prefix}blacklist add <@user/ID>\`\n` +
        `**${client.emoji?.dot || "•"} Remove User:** \`${prefix}blacklist remove <@user/ID>\`\n` +
        `**${client.emoji?.dot || "•"} List Blacklisted:** \`${prefix}blacklist list\``
      );

    return message.reply({
      components: [new ContainerBuilder().addTextDisplayComponents(helpDisplay)],
      flags: MessageFlags.IsComponentsV2
    });
  }
};
