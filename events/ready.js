const { Events, ActivityType } = require('discord.js');
const fullBotConfiguration = require('../config/bot-configuration.json');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client){
        switch (fullBotConfiguration.botActivity) {
            case 'watching':    client.user.setActivity(fullBotConfiguration.botActivityDetails, { type: ActivityType.Watching }); break;
            case 'streaming':   client.user.setActivity(fullBotConfiguration.botActivityDetails, { type: ActivityType.Streaming }); break;
            case 'playing':     client.user.setActivity(fullBotConfiguration.botActivityDetails, { type: ActivityType.Playing }); break;
            case 'listening':   client.user.setActivity(fullBotConfiguration.botActivityDetails, { type: ActivityType.Listening }); break;
            case 'competing':   client.user.setActivity(fullBotConfiguration.botActivityDetails, { type: ActivityType.Competing }); break;
        }
        
        switch (fullBotConfiguration.botStatus) {
            case 'online':      client.user.setStatus('online'); break;
            case 'idle':        client.user.setStatus('idle'); break;
            case 'dnd':         client.user.setStatus('dnd'); break;
            case 'invisible':   client.user.setStatus('invisible'); break;
        }

        console.log(`Bot online! Logged as ${client.user.tag}`);
    },
};