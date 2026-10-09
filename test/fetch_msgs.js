const { Client, GatewayIntentBits } = require('discord.js');
const config = require('../src/config.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', async () => {
  try {
    const channelId = process.env.LOG_CHANNEL_ID || '1557621712948830388';
    const channel = await client.channels.fetch(channelId);
    if (channel) {
      const messages = await channel.messages.fetch({ limit: 10 });
      console.log('--- RECENT BOT RESPONSES ---');
      messages.reverse().forEach(m => {
        if (m.author.id === client.user.id) {
          console.log('Bot message:');
          console.log(JSON.stringify(m.components, null, 2));
        } else {
          console.log('User:', m.content);
        }
      });
    }
  } catch (err) {
    console.log('fetch_msgs info:', err.message);
  } finally {
    await client.destroy();
    process.exit(0);
  }
});
client.login(config.token);
