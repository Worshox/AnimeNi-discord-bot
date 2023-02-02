const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Nie znaleziono komendy: ${interaction.commandName}`);
            interaction.reply(`Nie znaleziono komendy ${interaction.commandName}`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Wystąpił błąd przy wykonywaniu tej komendy: ${interaction.commandName}`)
            console.error(error);
            await interaction.reply({ content: 'Wystąpił błąd przy wykonywaniu tej komendy!', ephemeral: true});
        }
    },
}