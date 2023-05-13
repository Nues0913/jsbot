import { SlashCommandBuilder } from 'discord.js';
import { MyClan } from './coc.js'

const data = new SlashCommandBuilder()
.setName('coc')
.setDescription('coc');

async function execute(interaction) {
  await interaction.reply(`${MyClan['tag']}\n${MyClan['name']}`);
}

export { data, execute };