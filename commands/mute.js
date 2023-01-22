const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Wycisz użytkownika na serwerze')
        .addUserOption(option => option
            .setName('użytkownik')
            .setDescription(`Kogo chcesz wyciszyć`)
            .setRequired(true))
        .addStringOption(option => option
            .setName('czas')
            .setDescription('na jak długo chcesz wyciszyć użytkownika')
            .setRequired(true)
            .addChoices(
                { name: '1 godzina', value: '3_600_000' },
                { name: '1 dzień', value: '86_400_000' },
                { name: '1 tydzień', value: '604_800_000' },
                { name: '28 dni', value: '2_419_200_000' },
            ))
        .addStringOption(option => option
            .setName('powód')
            .setDescription('Dlaczego wyciszasz tego użytkownika'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const member = interaction.options.getMember('użytkownik');
        const time = Number(interaction.options.getString('czas'));
        const reason = interaction.options.getString('powód') || 'Nie podano przyczyny';

        await interaction.reply(`**Wyciszono** użytkownika ${member.username} z powodu: ${reason}, na czas: `);
        member.timeout(time, reason);
    },
};