const { SlashCommandBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { inlineCode } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const reactionRoles = require('../config/reaction-roles.json');
const { log } = require('../logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('usun-grupe-reakcji')
        .setDescription('Usuwa podaną grupę reakcji razem z jej rolami reakcji, oraz jej wiadomość')
        .addStringOption(option => option
            .setName('grupa')
            .setDescription('Grupa reakcji, którą chcesz usunąć')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const client = interaction.client;
        const groupName = interaction.options.getString('grupa');

        if (groupName in reactionRoles === false) {
            await interaction.reply('Podana grupa nie istnieje w grupach roli reakcji.');
            return;
        }

        const channel = client.channels.cache.get(reactionRoles[groupName].channelID);
        channel.messages.fetch(reactionRoles[groupName].messageID)
        .then(message => {
            message.delete();

            delete reactionRoles[groupName];

            const reactionRolesFile = path.resolve(__dirname, '../config/reaction-roles.json');
            fs.writeFile(reactionRolesFile, JSON.stringify(reactionRoles), (error) => {
                if (error) console.log(error);
            });
        });


        await interaction.reply(`Grupę ${inlineCode(groupName)} pomyślnie usunięto!`);

        log(`<usun-grupe-reakcji> Użytkownik ${interaction.user.tag} usunął grupę reakcji ${groupName}.`);
    },
};