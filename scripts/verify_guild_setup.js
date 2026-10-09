const config = require("../src/config.js");
const { REST, Routes } = require("discord.js");

const rest = new REST({ version: "10" }).setToken(config.token);

async function verify() {
  const guildId = "1523598777573970011";
  const guild = await rest.get(Routes.guild(guildId));
  const stickers = await rest.get(Routes.guildStickers(guildId));
  const sounds = await rest.get(Routes.guildSoundboardSounds(guildId));
  const onboarding = await rest.get(Routes.guildOnboarding(guildId));
  const botMember = await rest.get(Routes.guildMember(guildId, "863496211667484676"));
  const roles = await rest.get(Routes.guildRoles(guildId));

  console.log("=== GUILD ONBOARDING & SETUP VERIFICATION ===");
  console.log("Guild Name:", guild.name);
  console.log("Description:", guild.description);
  console.log("Verification Level:", guild.verification_level);
  console.log("Explicit Filter:", guild.explicit_content_filter);
  console.log("Default Notifications:", guild.default_message_notifications);
  console.log("Bot Server Profile Nickname:", botMember.nick);
  console.log("\n--- STICKERS (" + stickers.length + ") ---");
  stickers.forEach(s => console.log(`• ${s.name} (${s.id}) - tags: ${s.tags}`));
  
  const soundList = sounds.items || sounds;
  console.log("\n--- SOUNDBOARDS (" + soundList.length + ") ---");
  soundList.forEach(s => console.log(`• ${s.name} [${s.emoji_name || 'sound'}] (${s.sound_id})`));

  console.log("\n--- ROLES (" + roles.length + ") ---");
  roles.filter(r => r.name !== "@everyone").slice(0, 15).forEach(r => console.log(`• ${r.name} (${r.id})`));

  console.log("\n--- ONBOARDING STATUS ---");
  console.log("Enabled:", onboarding.enabled);
  console.log("Default Channels (" + onboarding.default_channel_ids.length + "):", onboarding.default_channel_ids.join(", "));
  console.log("Prompts Count:", onboarding.prompts.length);
  onboarding.prompts.forEach((p, idx) => {
    console.log(`\n  Question ${idx + 1}: ${p.title}`);
    p.options.forEach(opt => {
      console.log(`    - [${opt.emoji?.name || '*'}] ${opt.title} -> Roles: ${opt.role_ids.join(', ')}`);
    });
  });
}

verify();
