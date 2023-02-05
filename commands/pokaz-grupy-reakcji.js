const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { roleMention, inlineCode } = require('discord.js');
const reactionRoles = require('../config/reaction-roles.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pokaz-grupy-reakcji')
        .setDescription('Wyświetla listę aktualnie dostępnych grup roli reakcji')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        const client = interaction.client;

        let rolesContent = '';
        for (const singleGroup in reactionRoles) {
            rolesContent += `\n Grupa ról ${inlineCode(singleGroup)}: \n`;
            for (const singleRole in reactionRoles[singleGroup]) {
                if (Object.keys(reactionRoles[singleGroup]).length < 7) {
                    rolesContent += '- brak ról reakcji dla tej grupy \n';
                    break;
                }
                if (['messageID', 'channelID', 'title', 'colour', 'image', 'footer'].includes(singleRole)) continue;

                rolesContent += `- ${roleMention(singleRole)} z reakcją ${reactionRoles[singleGroup][singleRole][0]} \n`;
            }
        }

        const reactionRolesEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setTitle('Grupy roli reakcji na serwerze:')
            .setDescription(rolesContent || 'Brak ról reakcji')
            .setColor(0x950A0A)
            .setTimestamp()
            .setFooter({ text: 'AnimeNi', iconURL: client.user.displayAvatarURL() });

        await interaction.reply({ embeds: [reactionRolesEmbed] });
    },
};