const { SlashCommandBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { bold } = require('discord.js');
const { log } = require('../logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Odbanuj użytkownika na serwerze')
        .addUserOption(option => option
            .setName('użytkownik')
            .setDescription('Użytkownik, którego chcesz odbanować')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const user = interaction.options.getUser('użytkownik');

        await interaction.guild.members.unban(user);
        await interaction.reply(`${bold('Odbanowano')} użytkownika ${user.username}.`);

        log(`<unban> Użytkownik ${interaction.user.tag} odbanował użytkownika ${user.tag}.`);
    },
};