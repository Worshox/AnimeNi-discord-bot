const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { roleMention, inlineCode } = require('discord.js');
const { group } = require('node:console');
const fs = require('node:fs');
const path = require('node:path');
const reactionRoles = require('../config/reaction-roles.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('usun-role-reakcji')
        .setDescription('Usuń rolę, którą użytkownicy mogli sobie dodać przez dodanie reakcji')
        .addRoleOption(option => option
            .setName('rola')
            .setDescription('Rola, krórą chcesz usunąć z roli reakcji')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        const client = interaction.client;
        const role = interaction.options.getRole('rola');

        if (!Object.keys(reactionRoles).length) {
            await interaction.reply(`Żadna rola nie została dodana do ról reakcji, a ich wiadomość nie została stworzona! Dodaj pierwszą grupę roli reakcji komendą: ${inlineCode('/stworz-grupe-reakcji')} i pierwszą rolę reakcji za pomocą: ${inlineCode('/dodaj-role-reakcji')}`);
            return;
        }
        
        let roleExists = false;
        let groupName;
        for (const singleGroup in reactionRoles) {
            if (role.id in reactionRoles[singleGroup]) {
                roleExists = true;
                groupName = singleGroup;
            }
        }
        if (!roleExists) {
            await interaction.reply(`Rola ${roleMention(role.id)} nie ma reakcji!`);
            return;
        }

        const reaction = reactionRoles[groupName][role.id][0];
        delete reactionRoles[groupName][role.id];

        let reactionRolesContent = '';
        for (const singleReactionRole in reactionRoles[groupName]) {
            if (['messageID', 'channelID', 'title', 'colour', 'image', 'footer'].includes(singleReactionRole)) continue;

            reactionRolesContent += `${reactionRoles[groupName][singleReactionRole][0]} - ${roleMention(singleReactionRole)} - ${reactionRoles[groupName][singleReactionRole][1]} \n`;
        }

        const reactionRolesEmbed = new EmbedBuilder()
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setTitle(reactionRoles[groupName].title)
            .setDescription(reactionRolesContent || 'Nie dodano jeszcze ról')
            .setColor(reactionRoles[groupName].colour)
            .setImage(reactionRoles[groupName].image)
            .setTimestamp()
            .setFooter({ text: reactionRoles[groupName].footer, iconURL: client.user.displayAvatarURL() });

        const channel = client.channels.cache.get(reactionRoles[groupName].channelID);
        const emoji = reaction.startsWith('<') ? reaction.substring(1, reaction.length-1).split(':')[2] : reaction;     //check if emoji is custom
        const reactionRolesFile = path.resolve(__dirname, '../config/reaction-roles.json');
        channel.messages.fetch(reactionRoles[groupName].messageID)
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