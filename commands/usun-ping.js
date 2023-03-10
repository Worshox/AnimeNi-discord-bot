const { SlashCommandBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const videoPings = require('../config/video-pings.json');
const { log } = require('../logger');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('usun-ping')
    .setDescription('Usuwa rolę z pingowania odcinków')
    .addRoleOption(option => option
            .setName('rola')
            .setDescription('Rola krórą chcesz usunąć')
            .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const role = interaction.options.getRole('rola');
        
        if (role.name in videoPings === false) {
            await interaction.reply(`Rola ${role.name} nie istnieje w pingach odcinków!`);
            return;
        }

        delete videoPings[role.name];

        await interaction.reply(`Rola ${role} została pomyślnie usunięta z pingów!`);

        const videoPingsFile = path.resolve(__dirname, '../config/video-pings.json');
        fs.writeFile(videoPingsFile, JSON.stringify(videoPings), (error) => {
            if (error) console.log(error);
        });

        // log(`<usun-ping> Użytkownik ${interaction.user.tag} usunął rolę ${role.name} z pingów odcinków.`);
    },
};