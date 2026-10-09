const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  MessageFlags
} = require("discord.js");
const emoji = require("../../emojis");

module.exports = {
  name: "node",
  category: "Information",
  description: "Shows Node information.",
  botPerms: ["EmbedLinks"],
  args: false,
  usage: "",
  userPerms: [],
  owner: true,
  cooldown: 3,

  slashOptions: [],
  async slashExecute(interaction, client) {
    const nodes = [...client.manager.shoukaku.nodes.values()];

    if (nodes.length === 0 || !nodes[0].stats) {
      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.cross} Node: Disconnected**`);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorDisplay);

      return interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const node = nodes[0];
    const status = node.stats ? "Connected" : "Disconnected";
    const uptime = node.stats ? new Date(node.stats.uptime).toISOString().slice(11, 19) : "N/A";

    const headerDisplay = new TextDisplayBuilder()
      .setContent(`**${client.emoji.check} Audio Engine Node**`);

    const separator1 = new SeparatorBuilder();

    const playersCount = node.stats?.players ?? 0;
    const playingCount = node.stats?.playingPlayers ?? 0;
    const reservableMem = Math.round((node.stats?.memory?.reservable ?? 0) / 1024 / 1024);
    const usedMem = Math.round((node.stats?.memory?.used ?? 0) / 1024 / 1024);
    const freeMem = Math.round((node.stats?.memory?.free ?? 0) / 1024 / 1024);
    const allocatedMem = Math.round((node.stats?.memory?.allocated ?? 0) / 1024 / 1024);
    const cpuCores = node.stats?.cpu?.cores ?? "N/A";
    const systemLoad = (Math.round((node.stats?.cpu?.systemLoad ?? 0) * 100) / 100).toFixed(2);
    const engineLoad = (Math.round((node.stats?.cpu?.lavalinkLoad ?? 0) * 100) / 100).toFixed(2);

    const connectionDisplay = new TextDisplayBuilder()
      .setContent(
        `**TOGETHER is ${status}**\n` +
        `Player \`:\` \`${playersCount}\`\n` +
        `Playing Players \`:\` \`${playingCount}\`\n` +
        `Uptime \`:\` \`${uptime}\``
      );

    const separator2 = new SeparatorBuilder();

    const memoryDisplay = new TextDisplayBuilder()
      .setContent(
        `**Memory**\n` +
        `Reservable Memory \`:\` \`${reservableMem} MB\`\n` +
        `Used Memory \`:\` \`${usedMem} MB\`\n` +
        `Free Memory \`:\` \`${freeMem} MB\`\n` +
        `Allocated Memory \`:\` \`${allocatedMem} MB\``
      );

    const separator3 = new SeparatorBuilder();

    const cpuDisplay = new TextDisplayBuilder()
      .setContent(
        `**CPU**\n` +
        `Cores \`:\` \`${cpuCores}\`\n` +
        `System Load \`:\` \`${systemLoad}%\`\n` +
        `Engine Load \`:\` \`${engineLoad}%\``
      );

    const container = new ContainerBuilder()
      .addTextDisplayComponents(headerDisplay)
      .addSeparatorComponents(separator1)
      .addTextDisplayComponents(connectionDisplay)
      .addSeparatorComponents(separator2)
      .addTextDisplayComponents(memoryDisplay)
      .addSeparatorComponents(separator3)
      .addTextDisplayComponents(cpuDisplay);

    interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  },
  async execute(message, args, client, prefix) {
    const nodes = [...client.manager.shoukaku.nodes.values()];

    if (nodes.length === 0 || !nodes[0].stats) {
      const errorDisplay = new TextDisplayBuilder()
        .setContent(`**${client.emoji.cross} Node: Disconnected**`);

      const container = new ContainerBuilder()
        .addTextDisplayComponents(errorDisplay);

      return message.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });
    }

    const node = nodes[0];
    const status = node.stats ? "Connected" : "Disconnected";
    const uptime = node.stats ? new Date(node.stats.uptime).toISOString().slice(11, 19) : "N/A";

    const headerDisplay = new TextDisplayBuilder()
      .setContent(`**${client.emoji.check} Audio Engine Node**`);

    const separator1 = new SeparatorBuilder();

    const pCount = node.stats?.players ?? 0;
    const plCount = node.stats?.playingPlayers ?? 0;
    const resMem = Math.round((node.stats?.memory?.reservable ?? 0) / 1024 / 1024);
    const uMem = Math.round((node.stats?.memory?.used ?? 0) / 1024 / 1024);
    const fMem = Math.round((node.stats?.memory?.free ?? 0) / 1024 / 1024);
    const aMem = Math.round((node.stats?.memory?.allocated ?? 0) / 1024 / 1024);
    const cCores = node.stats?.cpu?.cores ?? "N/A";
    const sLoad = (Math.round((node.stats?.cpu?.systemLoad ?? 0) * 100) / 100).toFixed(2);
    const eLoad = (Math.round((node.stats?.cpu?.lavalinkLoad ?? 0) * 100) / 100).toFixed(2);

    const connectionDisplay = new TextDisplayBuilder()
      .setContent(
        `**TOGETHER is ${status}**\n` +
        `Player \`:\` \`${pCount}\`\n` +
        `Playing Players \`:\` \`${plCount}\`\n` +
        `Uptime \`:\` \`${uptime}\``
      );

    const separator2 = new SeparatorBuilder();

    const memoryDisplay = new TextDisplayBuilder()
      .setContent(
        `**Memory**\n` +
        `Reservable Memory \`:\` \`${resMem} MB\`\n` +
        `Used Memory \`:\` \`${uMem} MB\`\n` +
        `Free Memory \`:\` \`${fMem} MB\`\n` +
        `Allocated Memory \`:\` \`${aMem} MB\``
      );

    const separator3 = new SeparatorBuilder();

    const cpuDisplay = new TextDisplayBuilder()
      .setContent(
        `**CPU**\n` +
        `Cores \`:\` \`${cCores}\`\n` +
        `System Load \`:\` \`${sLoad}%\`\n` +
        `Engine Load \`:\` \`${eLoad}%\``
      );

    const container = new ContainerBuilder()
      .addTextDisplayComponents(headerDisplay)
      .addSeparatorComponents(separator1)
      .addTextDisplayComponents(connectionDisplay)
      .addSeparatorComponents(separator2)
      .addTextDisplayComponents(memoryDisplay)
      .addSeparatorComponents(separator3)
      .addTextDisplayComponents(cpuDisplay);

    message.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });
  },
};
