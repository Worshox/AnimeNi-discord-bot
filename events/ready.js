const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client){
        console.log(`Bot online! Zalogowano jako ${client.user.tag}`);
    },
};