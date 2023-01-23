const { SlashCommandBuilder, ActivityType } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
let fullBotConfiguration = require('../config/bot-configuration.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('konfiguruj-bota')
        .setDescription('Skonfiguruj nazwę/avatar/aktywność/status bota')
        .addStringOption(option => option
            .setName('nazwa')
            .setDescription('Nazwę bota'))
        .addStringOption(option => option
            .setName('avatar')
            .setDescription('Dokładny URL do pliku z obrazkiem'))
        .addStringOption(option => option
            .setName('aktywność')
            .setDescription('Aktywność bota, musisz podać też parametr "szczegóły-aktywności"')
            .addChoices(
                { name: 'Ogląda', value: 'watching' },
                { name: 'Stramuje', value: 'streaming' },
                { name: 'Gra', value: 'playing' },
                { name: 'Słucha', value: 'listening' },
                { name: 'Uczestniczy', value: 'competing' },
            ))
        .addStringOption(option => option
            .setName('szczegóły-aktywności')
            .setDescription('Np. Ogląda <nazwa> (Podajesz wartośść <nazwa>)'))
        .addStringOption(option => option
            .setName('status')
            .setDescription('Aktualny status bota: online/zaraz wracam/nie przeszkadzać/niewidoczny')
            .addChoices(
                { name: 'Online', value: 'online' },
                { name: 'Zaraz warcam', value: 'idle' },
                { name: 'Nie przeszkadzać', value: 'dnd' },
                { name: 'Niedostępny', value: 'invisible' }
            ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (interaction.options.getString('nazwa')) {
            try {
                interaction.client.user.setUsername(interaction.options.getString('nazwa'));
                fullBotConfiguration.botName = interaction.options.getString('nazwa');
            }
            catch (error) {
                await interaction.reply({ content: 'Wystąpił błąd, najprawdopodomniej wprowadzona nazwa jest zbyt popularna', ephemeral: true});
                return;
            }
        }

        if (interaction.options.getString('avatar')) {
            try{
                interaction.client.user.setAvatar(interaction.options.getString('avatar'));
                fullBotConfiguration.botAvatarURL = interaction.options.getString('avatar');
            } catch (error) {
                await interaction.reply({ content: 'Wystąpił błąd, najprawdopodomniej podałeś zły URL obrazu', ephemeral: true});
                return;
            }
        }

        if (interaction.options.getString('aktywność') && interaction.options.getString('szczegóły-aktywności')) {
            const activityDetails = interaction.options.getString('szczegóły-aktywności');
            switch (interaction.options.getString('aktywność')) {
                case 'watching': 
                    interaction.client.user.setActivity(activityDetails, { type: ActivityType.Watching }); 
                    fullBotConfiguration.botActivity = "watching";
                    break;
                case 'streaming': 
                    interaction.client.user.setActivity(activityDetails, { type: ActivityType.Streaming }); 
                    fullBotConfiguration.botActivity = "streaming";
                    break;
                case 'playing': 
                    interaction.client.user.setActivity(activityDetails, { type: ActivityType.Playing }); 
                    fullBotConfiguration.botActivity = "playing";
                    break;
                case 'listening': 
                    interaction.client.user.setActivity(activityDetails, { type: ActivityType.Listening });     
                    fullBotConfiguration.botActivity = "listening";
                    break;
                case 'competing': 
                    interaction.client.user.setActivity(activityDetails, { type: ActivityType.Competing }); 
                    fullBotConfiguration.botActivity = "competing";
                    break;
            }
            fullBotConfiguration.botActivityDetails = activityDetails;
        }

        if (interaction.options.getString('status')) {
            switch (interaction.options.getString('status')) {
                case 'online': 
                    interaction.client.user.setStatus('online'); 
                    fullBotConfiguration.botStatus = 'online';
                    break;
                case 'idle': 
                    interaction.client.user.setStatus('idle'); 
                    fullBotConfiguration.botStatus = 'idle';
                    break;
                case 'dnd': 
                    interaction.client.user.setStatus('dnd'); 
                    fullBotConfiguration.botStatus = 'dnd';
                    break;
                case 'invisible': 
                    interaction.client.user.setStatus('invisible'); 
                    fullBotConfiguration.botStatus = 'invisible';
                    break;
            }
        }

        const newBotConfiguration = JSON.stringify(fullBotConfiguration);
        const botConfigurationFile = path.resolve(__dirname, '../config/bot-configuration.json');
        fs.writeFile(botConfigurationFile, newBotConfiguration, (error) => {
            if (error) console.log(error);
        });

        await interaction.reply('Zapisano ustawienia bota!');
    },
};