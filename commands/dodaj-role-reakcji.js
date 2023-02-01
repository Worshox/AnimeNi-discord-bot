const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { roleMention } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const reactionRoles = require('../config/reaction-roles.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dodaj-role-reakcji')
        .setDescription('Dodaj rolę, którą użytkownicy będą mogli sobie dodać poprzez reakcję')
        .addRoleOption(option => option
            .setName('rola')
            .setDescription('Rola króra ma być dodawana przez reakcję')
            .setRequired(true))
        .addStringOption(option => option
            .setName('reakcja')
            .setDescription('Reakcja którą musi dać użytkownik, aby otrzymać rolę')
            .setRequired(true))
        .addStringOption(option => option
            .setName('opis')
            .setDescription('Krótki opis roli reakcji')
            .setRequired(true))
        .addChannelOption(option => option
            .setName('kanał')
            .setDescription('Kanał na który ma zostać wysłana wiadomosć z reakcjami (jeśli nie istnieje)')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        const client = interaction.client;
        const role = interaction.options.getRole('rola');
        const reaction = interaction.options.getString('reakcja');
        const description = interaction.options.getString('opis');

        for (const singleReactionRole in reactionRoles) {
            if (singleReactionRole === role.id) {
                await interaction.reply(`Rola ${roleMention(role.id)} już ma swoją reakcję!`);
                return;
            }

            if (reactionRoles[singleReactionRole][0] === reaction) {
                await interaction.reply(`Reakcja ${reaction} już jest zajęta!`);
                return;
            }
        }

        reactionRoles[role.id] = [reaction, description];

        let reactionRolesContent = '';
        for (const singleReactionRole in reactionRoles) {
            if (["messageID", "channelID"].includes(singleReactionRole)) continue;

            reactionRolesContent += `${reactionRoles[singleReactionRole][0]} - ${roleMention(singleReactionRole)} - ${reactionRoles[singleReactionRole][1]}\n`;
        }

        const reactionRolesEmbed = new EmbedBuilder()
            .setColor(0x950A0A)
            .setTitle('Role na serwerze AnimeNi')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setDescription(reactionRolesContent)
            .setTimestamp()
            .setFooter({ text: 'AnimeNi', iconURL: client.user.displayAvatarURL() });

        const reactionRolesFile = path.resolve(__dirname, '../config/reaction-roles.json');
        if (reactionRoles.messageID) {
            const channel = client.channels.cache.get(reactionRoles.channelID);
            channel.messages.fetch(reactionRoles.messageID)
                .then(message => {
                    message.edit({ embeds: [reactionRolesEmbed] });
                    message.react(reaction);
                    fs.writeFile(reactionRolesFile, JSON.stringify(reactionRoles), (error) => {
                        if (error) console.log(error);
                    });
                });
        } else {
            const channel = interaction.options.getChannel('kanał');
            if (!channel || channel.type > 0){
                await interaction.reply('Podałeś zły kanał');
                delete reactionRoles[role.id];
                return;
            }

            const message = await channel.send({ embeds: [reactionRolesEmbed] });
            message.react(reaction);
            reactionRoles.messageID = message.id;
            reactionRoles.channelID = message.channelId;

            fs.writeFile(reactionRolesFile, JSON.stringify(reactionRoles), (error) => {
                if (error) console.log(error);
            });
        }

        await interaction.reply('Rolę reakcji pomyślnie dodano!');
    },
};