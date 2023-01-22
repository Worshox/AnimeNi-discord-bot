const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Odbanuj użytkownika na serwerze')
        .addUserOption(option => option
            .setName('użytkownik')
            .setDescription('Kogo chcesz odbanować')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('użytkownik');

        await interaction.reply(`**Odbanowano** użytkownika ${user.username}.`);
        await interaction.guild.members.unban(user);
    },
};