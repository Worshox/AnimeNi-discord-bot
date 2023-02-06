const { Events, EmbedBuilder } = require('discord.js');
const { roleMention } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const reactionRoles = require('../config/reaction-roles.json');
const { log } = require('../logger');

module.exports = {
    name: Events.GuildRoleDelete,
    async execute(role){
        let roleExists = false;
        let groupName;
        for (const singleGroup in reactionRoles) {
            if (role.id in reactionRoles[singleGroup]) {
                roleExists = true;
                groupName = singleGroup;
                break;
            }
        }

        if (!roleExists) return;
        
        const client = role.client;
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
        
        // log(`Ze względu na usunięcie roli ${role.name}, usunięto ją z roli reakcji dla grupy ${groupName}`);
    },
};