const { SlashCommandBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { bold } = require('discord.js');
const { log } = require('../logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Zbanuj użytkownika na serwerze')
        .addUserOption(option => option
            .setName('użytkownik')
            .setDescription('Użytkownik, którego chcesz zbanować')
            .setRequired(true))
        .addStringOption(option => option
            .setName('powód')
            .setDescription('Dlaczego banujesz daną osobę'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const client = interaction.client;
        const user = interaction.options.getUser('użytkownik');
        const reason = interaction.options.getString('powód') || 'Nie podano przyczyny';

        try {
            client.users.send(user.id, { content: `Zostałeś zbanowany na serwerze AnimeNi z powodu: ${reason}.` });
        } catch (error) {
            console.log('Nie można wysłać wiadomości do tego użytkownika');
        }

        await interaction.guild.members.ban(user);

        await interaction.reply(`${bold('Zbanowano')} użytkownika ${user.tag} z powodu: ${reason}.`);
        
        // log(`<ban> Użytkownik ${interaction.user.tag} zbanował użytkownika ${user.tag} z powodu: ${reason}.`);
    },
};