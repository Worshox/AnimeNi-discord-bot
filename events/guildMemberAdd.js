const { Events, EmbedBuilder } = require('discord.js');
const { userMention, channelMention, hyperlink } = require('discord.js');
const { welcomeChannelID, welcomeChannelMessage, welcomePrivateMessage, welcomeMessageImage } = require('../config/welcome.json');
const { botAvatarURL } = require('../config/bot-configuration.json');

module.exports = {
    name: Events.GuildMemberAdd,
    once: true,
    execute(member){
        const client = member.client;

        const welcomeChannelEmbed = new EmbedBuilder()
            .setColor(0x950A0A)
            .setTitle("Witaj w ekipie AnimeNi!")
            .setAuthor({ name: client.user.username, iconURL: botAvatarURL })
            .setDescription(`${welcomeChannelMessage}`)
            .setImage(welcomeMessageImage)
            .setTimestamp()
            .setFooter({ text: `Jesteś ${member.guild.memberCount}. członkiem serwera`, iconURL: member.avatar });

        const channel = client.channels.cache.get(welcomeChannelID);
        channel.send({ embeds: [welcomeChannelEmbed] });


        const welcomePrivateEmbed = new EmbedBuilder()
            .setColor(0x950A0A)
            .setTitle("Witaj w ekipie AnimeNi!")
            .setAuthor({ name: client.user.username, iconURL: botAvatarURL })
            .setDescription(`${welcomePrivateMessage}`)
            .setImage(welcomeMessageImage)
            .setTimestamp()
            .setFooter({ text: `Jesteś ${member.guild.memberCount}. członkiem serwera`, iconURL: member.avatar });

        client.users.send(member.id, { embeds: [welcomePrivateEmbed] });
    },
};