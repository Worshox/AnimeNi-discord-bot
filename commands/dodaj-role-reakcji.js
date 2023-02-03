const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { roleMention, inlineCode } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const reactionRoles = require('../config/reaction-roles.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dodaj-role-reakcji')
        .setDescription('Dodaj rolę, którą użytkownicy będą mogli sobie dodać poprzez reakcję')
        .addRoleOption(option => option
            .setName('rola')
            .setDescription('Rola, króra ma być dodawana przez reakcję')
            .setRequired(true))
        .addStringOption(option => option
            .setName('reakcja')
            .setDescription('Reakcja, którą musi dać użytkownik, aby otrzymać rolę')
            .setRequired(true))
        .addStringOption(option => option
            .setName('opis')
            .setDescription('Krótki opis roli reakcji')
            .setRequired(true))
        .addStringOption(option => option
            .setName('grupa')
            .setDescription('Nazwa grupy reakcji, do której chcesz dodać rolę reakcji')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        const client = interaction.client;
        const role = interaction.options.getRole('rola');
        const reaction = interaction.options.getString('reakcja');
        const description = interaction.options.getString('opis');
        const group = interaction.options.getString('grupa');

        if (group in reactionRoles === false) {
            await interaction.reply(`Grupa roli reakcji ${inlineCode(group)} nie istnieje!`);
            return;
        }

        for (const singleGroup in reactionRoles) {
            if (role.id in reactionRoles[singleGroup]) {
                await interaction.reply(`Rola ${role} już ma swoją reakcję!`);
                return;
            }

            for (const singleRole in reactionRoles[singleGroup]) {
                if (['messageID', 'channelID', 'title', 'colour', 'image', 'footer'].includes(singleRole)) continue;
                if (reactionRoles[singleGroup][singleRole][0] === reaction) {
                    await interaction.reply(`Reakcja ${reaction} już jest zajęta!`);
                    return;
                }
            }
        }

        reactionRoles[group][role.id] = [reaction, description];

        let reactionRolesContent = '';
        for (const singleReactionRole in reactionRoles[group]) {
            if (['messageID', 'channelID', 'title', 'colour', 'image', 'footer'].includes(singleReactionRole)) continue;

            reactionRolesContent += `${reactionRoles[group][singleReactionRole][0]} - ${roleMention(singleReactionRole)} - ${reactionRoles[group][singleReactionRole][1]} \n`;
        }

        const reactionRolesEmbed = new EmbedBuilder()
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setTitle(reactionRoles[group].title)
            .setDescription(reactionRolesContent)
            .setColor(reactionRoles[group].colour)
            .setImage(reactionRoles[group].image)
            .setTimestamp()
            .setFooter({ text: reactionRoles[group].footer, iconURL: client.user.displayAvatarURL() });

        const channel = client.channels.cache.get(reactionRoles[group].channelID);
        channel.messages.fetch(reactionRoles[group].messageID)
        .then(message => {
            message.edit({ embeds: [reactionRolesEmbed] });
            message.react(reaction);
            const reactionRolesFile = path.resolve(__dirname, '../config/reaction-roles.json');
            fs.writeFile(reactionRolesFile, JSON.stringify(reactionRoles), (error) => {
                if (error) console.log(error);
            });
        });
        
        await interaction.reply('Rolę reakcji pomyślnie dodano!');
    },
};