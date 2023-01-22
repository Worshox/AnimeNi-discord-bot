const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const { clientID, guildID } = require('./config/config.json');
require('dotenv').config({ path: './config/.env' });

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} (/) application commands.`);

        const data = await rest.put(
            Routes.applicationGuildCommands(clientID, guildID),
            { body: commands },
        );

        console.log(`Successfully refreshed ${commands.length} (/) application commands.`)
    } catch (error) {
        console.error(error);
    }
})();