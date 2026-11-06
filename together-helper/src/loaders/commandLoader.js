const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");
const config = require("../config");

module.exports = async (client) => {
  const commands = [];
  const commandsPath = path.join(__dirname, "../commands");

  const categories = fs.readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(categoryPath).filter(f => f.endsWith(".js"));

    for (const file of commandFiles) {
      const command = require(path.join(categoryPath, file));
      if (!command.name) continue;

      client.commands.set(command.name, command);

      commands.push({
        name: command.name,
        description: command.description || "No description provided",
        options: command.slashOptions || [],
        default_member_permissions: command.userPerms ? "8" : null
      });
    }
  }

  console.log(`[Loader] Loaded ${client.commands.size} helper slash commands.`);

  if (config.token) {
    const rest = new REST({ version: "10" }).setToken(config.token);
    try {
      console.log(`[Slash] Registering ${commands.length} global slash commands with Discord...`);
      await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
      console.log(`[Slash] Successfully deployed ${commands.length} helper slash commands globally.`);
    } catch (err) {
      console.error("[Slash Deployment Error]", err);
    }
  }
};
