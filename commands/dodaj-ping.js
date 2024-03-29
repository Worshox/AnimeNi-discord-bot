const { SlashCommandBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const videoPings = require('../config/video-pings.json');
const { log } = require('../logger');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('dodaj-ping')
    .setDescription('Dodaje nową rolę do pingowania odcinków')
    .addRoleOption(option => option
        .setName('rola')
        .setDescription('Rola, krórą chcesz dodać')
        .setRequired(true))
    .addStringOption(option => option
        .setName('slug')
        .setDescription('Fragment w linku z nazwą serii (min. 2 słowa oddzielone "-")')
        .setRequired(true))
    .addStringOption(option => option
        .setName('kanał')
        .setDescription('Kanał na który mają zostać wysyłane powiadomienia')
        .addChoices(
            { name: 'odcinki', value: '1' },
            { name: 'sezonowy', value: '2' }, )
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const role = interaction.options.getRole('rola');
        const slug = interaction.options.getString('slug');
        const channel = +interaction.options.getString('kanał');

        if (role.name in videoPings) {
            await interaction.reply(`Rola ${role.name} już była dodana do pingów!`);
            return;
        }

        videoPings[role.name] = [slug, role.id, channel];

        await interaction.reply(`Rola ${role} została pomyślnie dodana do pingów odcinków!`);

        const videoPingsFile = path.resolve(__dirname, '../config/video-pings.json');
        fs.writeFile(videoPingsFile, JSON.stringify(videoPings), (error) => {
            if (error) console.log(error);
        });

        // log(`<dodaj-ping> Użytkownik ${interaction.user.tag} dodał rolę ${role.name} do pingów odcinków.`);
    },
};