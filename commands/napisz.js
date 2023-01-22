const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('napisz')
        .setDescription('Wyślij wiadomość na czacie jako bot')
        .addChannelOption(option => option
            .setName('kanał')
            .setDescription('Kanał na który ma zostać wysłana wiadomość')
            .setRequired(true))
        .addStringOption(option => option
            .setName('wiadomość')
            .setDescription('Treść wysyłanej wiadomości')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const channel = interaction.options.getChannel('kanał');
        const content = interaction.options.getString('wiadomość');

        if (channel.type != 0){
            await interaction.reply('Zły kanał - możesz podać tylko kanał tekstowy.');
            return;
        }

        channel.send(content);
        await interaction.reply(`Wysłano wiadomość na kanał: ${channel} o treści: "${content}"`);
    },
};