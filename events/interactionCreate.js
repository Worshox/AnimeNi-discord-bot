const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Command not found: ${interaction.commandName}`);
            interaction.reply(`Nie znaleziono komendy ${interaction.commandName}`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error occurred while executing: ${interaction.commandName}`)
            console.error(error);
            await interaction.reply({ content: 'Wystąpił błąd przy wykonywaniu tej komendy!', ephemeral: true});
        }
    },
}