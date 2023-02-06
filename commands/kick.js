const { SlashCommandBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { bold } = require('discord.js');
const { log } = require('../logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Wyrzuć użytkownika z serwera')
        .addUserOption(option => option
            .setName('użytkownik')
            .setDescription(`Użytkownik, którego chcesz wyrzucić`)
            .setRequired(true))
        .addStringOption(option => option
            .setName('powód')
            .setDescription('Dlaczego wyrzucasz tą osobę'))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        const member = interaction.options.getMember('użytkownik');
        const reason = interaction.options.getString('powód') || 'Nie podano przyczyny';

        await interaction.reply(`${bold('Wyrzucono')} użytkownika ${member.user.tag} z powodu: ${reason}.`);
        member.kick(reason);

        log(`<kick> Użytkownik ${interaction.user.tag} wyrzucił użytkownika ${member.user.tag} z powodu: ${reason}.`);
    },
};