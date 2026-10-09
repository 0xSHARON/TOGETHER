const { REST, Routes, Client, GatewayIntentBits } = require("discord.js");
const config = require("../src/config");

async function clearGuildSlashCommands() {
  if (!config.token) {
    console.error("No BOT_TOKEN found in .env / config");
    process.exit(1);
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  console.log("Logging into Discord to fetch connected guilds...");
  await client.login(config.token);

  const rest = new REST({ version: "10" }).setToken(config.token);
  const guilds = Array.from(client.guilds.cache.values());

  console.log(`Connected to ${guilds.length} guilds.`);
  console.log("Purging all guild-level slash commands to leave only global commands...");

  for (const guild of guilds) {
    try {
      await rest.put(Routes.applicationGuildCommands(client.user.id, guild.id), {
        body: [],
      });
      console.log(`✔ Cleared guild commands for: ${guild.name} (${guild.id})`);
    } catch (err) {
      console.error(`✖ Failed to clear guild commands for ${guild.name}:`, err.message);
    }
  }

  console.log("\nAll guild-level commands purged! Only global slash commands remain active.");
  client.destroy();
  process.exit(0);
}

clearGuildSlashCommands().catch((err) => {
  console.error("Error clearing guild slash commands:", err);
  process.exit(1);
});
