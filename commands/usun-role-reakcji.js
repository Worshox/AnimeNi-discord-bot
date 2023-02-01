const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { roleMention } = require('discord.js');
const { Console } = require('node:console');
const fs = require('node:fs');
const path = require('node:path');
const reactionRoles = require('../config/reaction-roles.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('usun-role-reakcji')
        .setDescription('Usuń rolę, którą użytkownicy mogli sobie dodać poprzez reakcję')
        .addRoleOption(option => option
            .setName('rola')
            .setDescription('Rola króra ma być dodawana przez reakcję')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        const client = interaction.client;
        const role = interaction.options.getRole('rola');

        if (!reactionRoles.messageID) {
            interaction.reply('Żadna rola nie została dodana do ról reakcji, a ich wiadomość nie została stworzona!');
            return;
        }

        if (role.id in reactionRoles === false) {
            interaction.reply(`Rola ${roleMention(role.id)} nie ma reakcji!`);
            return;
        }

        const reaction = reactionRoles[role.id][0];
        delete reactionRoles[role.id];

        let reactionRolesContent = '';
        for (const singleReactionRole in reactionRoles) {
            if (["messageID", "channelID"].includes(singleReactionRole)) continue;

            reactionRolesContent += `${reactionRoles[singleReactionRole][0]} - ${roleMention(singleReactionRole)} - ${reactionRoles[singleReactionRole][1]}\n`;
        }

        const reactionRolesEmbed = new EmbedBuilder()
            .setColor(0x950A0A)
            .setTitle('Role na serwerze AnimeNi')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setDescription(reactionRolesContent || "Brak ról do wyświetlenia")
            .setTimestamp()
            .setFooter({ text: 'AnimeNi', iconURL: client.user.displayAvatarURL() });

        const reactionRolesFile = path.resolve(__dirname, '../config/reaction-roles.json');
        const channel = client.channels.cache.get(reactionRoles.channelID);
        const emoji = reaction.startsWith('<') ? reaction.substring(1, reaction.length-1).split(':')[2] : reaction;
        channel.messages.fetch(reactionRoles.messageID)
            .then(message => {
                message.edit({ embeds: [reactionRolesEmbed] });
                message.reactions.cache.get(emoji).remove();
                fs.writeFile(reactionRolesFile, JSON.stringify(reactionRoles), (error) => {
                    if (error) console.log(error);
                });
            });

        await interaction.reply('Rolę reakcji pomyślnie usunięto!');
    },
};