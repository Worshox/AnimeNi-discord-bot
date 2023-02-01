const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('template')
        .setDescription('This is basic command template'),
    async execute(interaction) {
        await interaction.reply('It works!');
    },
};