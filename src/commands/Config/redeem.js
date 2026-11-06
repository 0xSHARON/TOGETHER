const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags
} = require("discord.js");
const { redeemPremiumCode } = require("../../utils/premiumCheck");

module.exports = {
  name: "redeem",
  category: "Config",
  aliases: ["claimcode", "activatecode", "premiumredeem"],
  description: "Redeem a TOGETHER PREMIUM key for yourself or this server.",
  cooldown: 5,
  slashOptions: [
    {
      name: "code",
      description: "The 16-character premium redemption key",
      type: 3,
      required: true
    }
  ],

  async slashExecute(interaction, client) {
    const code = interaction.options.getString("code");

    const wrapper = {
      guild: interaction.guild,
      channel: interaction.channel,
      author: interaction.user,
      member: interaction.member,
      reply: async (options) => {
        if (interaction.deferred) {
          return await interaction.editReply(options);
        } else if (interaction.replied) {
          return await interaction.followUp(options);
        } else {
          return await interaction.reply(options);
        }
      }
    };

    return this.execute(wrapper, [code], client, client.prefix || ".");
  },

  async execute(message, args, client, prefix) {
    const rawCode = args[0];
    if (!rawCode) {
      const textDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji?.warn || "⚠️"} Usage:** \`${prefix}redeem <TOGETHER-PREM-XXXX-XXXX>\`\nGet a code from **https://dash.together.dpdns.org/premium**`);
      
      const container = new ContainerBuilder().addTextDisplayComponents(textDisplay);
      return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    try {
      const result = await redeemPremiumCode(
        rawCode,
        message.author.id,
        message.author.tag || message.author.username,
        message.guild?.id || null,
        message.guild?.name || null
      );

      const expStr = result.expiresAt
        ? `<t:${Math.floor(new Date(result.expiresAt).getTime() / 1000)}:R>`
        : "**Permanent Lifetime Access**";

      const successDisplay = new TextDisplayBuilder()
        .setContent(
          `## 👑 TOGETHER PREMIUM ACTIVATED!\n\n` +
          `> ${result.message}\n\n` +
          `• **Plan Tier:** \`${result.plan.toUpperCase()}\`\n` +
          `• **Target Scope:** \`${result.scope.toUpperCase()}\` (${result.targetName})\n` +
          `• **Expiration:** ${expStr}\n` +
          `• **Official Invoice:** \`${result.invoiceId}\`\n\n` +
          `*All premium features, 320kbps lossless streaming, and 24/7 controls are now active.*`
        );

      const container = new ContainerBuilder()
        .addTextDisplayComponents(successDisplay);

      return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    } catch (err) {
      const errDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji?.cross || "❌"} Redemption Failed:**\n${err.message}`);

      const container = new ContainerBuilder().addTextDisplayComponents(errDisplay);
      return message.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
  }
};

