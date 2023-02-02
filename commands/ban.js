const { SlashCommandBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { bold } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Zbanuj użytkownika na serwerze')
        .addUserOption(option => option
            .setName('użytkownik')
            .setDescription('Kogo chcesz zbanować')
            .setRequired(true))
        .addStringOption(option => option
            .setName('powód')
            .setDescription('Dlaczego banujesz daną osobę'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const client = interaction.client;
        const user = interaction.options.getUser('użytkownik');
        const reason = interaction.options.getString('powód') || 'Nie podano przyczyny';

        client.users.send(user.id ,`Zostałeś zbanowany na serwerze AnimeNi z powodu: ${reason}.`);
        await interaction.guild.members.ban(user);

        await interaction.reply(`${bold('Zbanowano')} użytkownika ${user.tag} z powodu: ${reason}.`);
    },
};