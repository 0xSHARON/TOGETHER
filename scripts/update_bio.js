const config = require("../src/config.js");
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  try {
    console.log("Logged in as:", client.user.tag);
    const app = await client.application.fetch();

    // Fetch bot's application dot emoji
    let dot = "<:sb_dot:1545573806444249198>";
    try {
      const appEmojis = await client.application.emojis.fetch();
      const dotEmoji = appEmojis.find((e) => e.name === "sb_dot");
      if (dotEmoji) {
        dot = `<${dotEmoji.animated ? "a" : ""}:${dotEmoji.name}:${dotEmoji.id}>`;
      }
    } catch (e) {
      console.warn("Could not fetch application emojis, using fallback dot:", e.message);
    }

    const botName = client.user.username || "TOGETHER";
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${client.user.id}`;
    const supportUrl = config.links.support || "https://discord.gg/mUdGTs2Dw5";
    const voteUrl = config.links.vote || `https://top.gg/bot/${client.user.id}/vote`;

    const newDescription = [
      `${botName} is a high-quality music bot made for smooth and powerful audio streaming.`,
      "",
      "Important Links:",
      `${dot} Invite: [Invite](${inviteUrl})`,
      `${dot} Support: [Support Server](${supportUrl})`,
      `${dot} Vote: [Vote on Top.gg](${voteUrl})`
    ].join("\n");

    console.log("Description length:", newDescription.length, "/ 400 max characters");
    console.log("Previous description:\n" + app.description);
    console.log("Updating description to:\n" + newDescription);

    const updated = await app.edit({ description: newDescription });
    console.log("UPDATE_SUCCESSFUL");
    console.log("New description active on Discord:\n" + updated.description);
  } catch (err) {
    console.error("UPDATE_FAILED:", err);
  } finally {
    process.exit(0);
  }
});

client.login(config.token);
