import { SlashCommandBuilder } from 'discord.js';

const data = new SlashCommandBuilder()
.setName('pong')
.setDescription('Replies with Ping!');

async function execute(interaction) {
  await interaction.reply('Ping!');
}

export { data, execute };