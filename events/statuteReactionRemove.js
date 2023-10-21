// const { Events } = require('discord.js');
// const { userRoleID, messageID } = require('../config/ruleset.json');

// module.exports = {
//     name: Events.MessageReactionRemove,
//     async execute(reaction, user){
//         if (reaction.message.id !== messageID || reaction.emoji.name !== '✅') return;

//         if (reaction.partial) {
//             try {
//                 await reaction.fetch();
//             } catch (error){
//                 console.log('Nastąpił problem przy fetchowaniu wiadomości: ', error);
//                 return;
//             }
//         }

//         const guild = reaction.message.guild;
//         const member = guild.members.cache.get(user.id);
//         const role = reaction.message.guild.roles.cache.get(userRoleID);

//         member.roles.remove(role);
//     },
// };
