const { Events, EmbedBuilder } = require('discord.js');
const { roleMention } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const reactionRoles = require('../config/reaction-roles.json');

module.exports = {
    name: Events.GuildRoleDelete,
    async execute(role){
        if (role.id in reactionRoles === false) return;
        
        const client = role.client;
        const reaction = reactionRoles[role.id][0];

        delete reactionRoles[role.id];

        let reactionRolesContent = '';
        for (const singleReactionRole in reactionRoles) {
            if (['messageID', 'channelID'].includes(singleReactionRole)) continue;

            reactionRolesContent += `${reactionRoles[singleReactionRole][0]} - ${roleMention(singleReactionRole)} - ${reactionRoles[singleReactionRole][1]}\n`;
        }

        const reactionRolesEmbed = new EmbedBuilder()
            .setColor(0x950A0A)
            .setTitle('Role na serwerze AnimeNi')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setDescription(reactionRolesContent || 'Brak ról do wyświetlenia')
            .setTimestamp()
            .setFooter({ text: 'AnimeNi', iconURL: client.user.displayAvatarURL() });
        
        const channel = client.channels.cache.get(reactionRoles.channelID);
        const emoji = reaction.startsWith('<') ? reaction.substring(1, reaction.length-1).split(':')[2] : reaction;
        const reactionRolesFile = path.resolve(__dirname, '../config/reaction-roles.json');
        channel.messages.fetch(reactionRoles.messageID)
            .then(message => {
                message.edit({ embeds: [reactionRolesEmbed] });
                message.reactions.cache.get(emoji).remove();
                fs.writeFile(reactionRolesFile, JSON.stringify(reactionRoles), (error) => {
                    if (error) console.log(error);
                });
            });
    },
};