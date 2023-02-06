const { SlashCommandBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { bold } = require('discord.js');
const { log } = require('../logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Odcisz użytkownika na tym serwerze')
        .addUserOption(option => option
            .setName('użytkownik')
            .setDescription('Użytkownik, którego chcesz odciszyć')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const member = interaction.options.getMember('użytkownik');

        member.timeout(1);
        await interaction.reply(`${bold('Odciszono')} użytkownika ${member}.`);

        log(`<unmute> Użytkownik ${interaction.user.tag} odciszył użytkownika ${member.user.tag}.`);
    },
};