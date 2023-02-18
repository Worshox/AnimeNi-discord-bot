const { Events, EmbedBuilder } = require('discord.js');
const welcomeInfo = require('../config/welcome.json');
const { userMention } = require('discord.js');
const { log } = require('../logger');

module.exports = {
    name: Events.GuildMemberAdd,
    once: true,
    async execute(member){
        const client = member.client;

        const welcomeChannelEmbed = new EmbedBuilder()
            .setColor(0x950A0A)
            .setTitle('Witaj w ekipie AnimeNi!')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setDescription(`${member} ${welcomeInfo.channelMessage}`)
            .setImage(welcomeInfo.messageImage)
            .setTimestamp()
            .setFooter({ text: `Jesteś ${member.guild.memberCount}. członkiem serwera`, iconURL: member.avatar });

        const channel = client.channels.cache.get(welcomeInfo.channelID);
        channel.send({ embeds: [welcomeChannelEmbed] });

        const welcomePrivateEmbed = new EmbedBuilder()
            .setColor(0x950A0A)
            .setTitle('Witaj w ekipie AnimeNi!')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setDescription(`${userMention(member.id)} ${welcomeInfo.privateMessage}`)
            .setImage(welcomeInfo.messageImage)
            .setTimestamp()
            .setFooter({ text: `Jesteś ${member.guild.memberCount}. członkiem serwera`, iconURL: member.avatar });

        try {
            await client.users.send(member.id, { embeds: [welcomePrivateEmbed] });
        } catch (error) {
            console.log('Nie można wysłać wiadomości do tego użytkownika');
            return;
        }
        // log(`Użytkownik ${member.user.tag} wszedł na serwer.`);
    },
};