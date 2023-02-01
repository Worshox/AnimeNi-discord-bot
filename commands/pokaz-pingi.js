const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { roleMention } = require('discord.js');
const videoPings = require('../config/video-pings.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pokaz-pingi')
        .setDescription('Wyświetla listę aktualnie pingowanych ról przy odcinkach')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        let rolesContent = '';
        for (const singlePing in videoPings) {
            rolesContent = rolesContent.concat(`Rola: ${roleMention(videoPings[singlePing][1])}; slug: ${videoPings[singlePing][0]}\n`);
        }

        const videoPingsEmbed = new EmbedBuilder()
            .setColor(0x950A0A)
            .setTitle('Pingowane role odcinków:')
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL()})
            .setDescription(rolesContent || 'Brak pingowanych ról')
            .setTimestamp()
            .setFooter({ text: 'AnimeNi', iconURL: 'https://animeni.pl/wp-content/uploads/2022/12/logo-v2.png' });

        await interaction.reply({ embeds: [videoPingsEmbed] });
    },
};