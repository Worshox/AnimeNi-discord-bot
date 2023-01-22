const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Wyrzuć użytkownika z serwera')
        .addUserOption(option => option
            .setName('użytkownik')
            .setDescription(`Kogo chcesz wyrzucić`)
            .setRequired(true))
        .addStringOption(option => option
            .setName('powód')
            .setDescription('Dlaczego wyrzucasz tą osobę'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        const member = interaction.options.getMember('użytkownik');
        const reason = interaction.options.getString('powód') || 'Nie podano przyczyny';

        await interaction.reply(`**Wyrzucono** użytkownika ${member.user.tag} z powodu: ${reason}.`);
        member.kick(reason);
    },
};