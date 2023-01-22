const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Odcisz użytkownika na tym serwerze')
        .addUserOption(option => option
            .setName('użytkownik')
            .setDescription('Kogo chcesz odciszyć')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const member = interaction.options.getMember('użytkownik');

        await interaction.reply(`**Odciszono** użytkownika ${member.nickname}.`);
        member.timeout(0, 'Administracja się nad tobą zlitowała i Cię odciszyła.');
    },
};