const { Events } = require('discord.js');
const reactionRoles = require('../config/reaction-roles.json');

module.exports = {
    name: Events.MessageReactionRemove,
    async execute(reaction, user){
        let roleExists = false;
        let groupName;
        for (const singleGroup in reactionRoles) {
            if (reactionRoles[singleGroup].messageID === reaction.message.id) {
                roleExists = true;
                groupName = singleGroup;
                break;
            }
        }
        
        if (!roleExists) return;

        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error){
                console.log('Nastąpił problem przy fetchowaniu wiadomości: ', error);
                return;
            }
        }

        const guild = reaction.message.guild;
        const member = guild.members.cache.get(user.id);

        let role;
        for (const singleRole in reactionRoles[groupName]) {
            if (['messageID', 'channelID', 'title', 'colour', 'image', 'footer'].includes(singleRole)) continue;

            if (reactionRoles[groupName][singleRole][0].includes(reaction.emoji.name)) {
                role = reaction.message.guild.roles.cache.find(role => role.id === singleRole);
            }
        }
        
        if (!role) return;
        
        member.roles.remove(role);
    },
};