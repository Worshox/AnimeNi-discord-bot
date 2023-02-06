const { SlashCommandBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { inlineCode } = require('discord.js');
const { log } = require('../logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stworz-pinga')
        .setDescription('Odpowiednio formatuje podane wejście i zwraca pingowalny tekst')
        .addSubcommand(subcommand => subcommand
                .setName('użytkownik')
                .setDescription('Stwórz pinga użytkownika')
                .addUserOption(option => option
                    .setName('użytkownik')
                    .setDescription('Użytkownik, którego chcesz spingować')
                    .setRequired(true)))
        .addSubcommand(subcommand => subcommand
                .setName('kanał')
                .setDescription('Stwórz pinga kanału')
                .addChannelOption(option => option
                    .setName('kanał')
                    .setDescription('Kanał, który chcesz spingować')
                    .setRequired(true)))
        .addSubcommand(subcommand => subcommand
                .setName('rola')
                .setDescription('Stwórz pinga roli')
                .addRoleOption(option => option
                    .setName('rola')
                    .setDescription('Rola, którą chcesz spingować')
                    .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        let formattedPing;
        if (interaction.options.getSubcommand() === 'użytkownik') formattedPing = inlineCode(interaction.options.getUser('użytkownik'));
        if (interaction.options.getSubcommand() === 'kanał') formattedPing = inlineCode(interaction.options.getChannel('kanał'));
        if (interaction.options.getSubcommand() === 'rola') formattedPing = inlineCode(interaction.options.getRole('rola'));

        await interaction.reply(`Proszę bardzo, oto twój ping! \n ${formattedPing}`);

        log(`<stworz-pinga> Użytkownik ${interaction.user.tag} utworzył sobie pinga ${formattedPing}.`);
    },
};