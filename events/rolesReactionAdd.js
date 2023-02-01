const { Events } = require('discord.js');
const reactionRoles = require('../config/reaction-roles.json');

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user){
        if (reaction.message.id !== reactionRoles.messageID) return; 
        
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
        for (const singleRole in reactionRoles)
            if (reactionRoles[singleRole][0].includes(reaction.emoji.name))
                role = reaction.message.guild.roles.cache.find(role => role.id === singleRole);

        if (!role) return;
        
        member.roles.add(role);
    },
};