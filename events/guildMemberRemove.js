const { Events, EmbedBuilder } = require('discord.js');
const { userMention } = require('discord.js');
const { byeChannelID, byeMessage, byeMessageImage } = require('../config/bye.json');
const { botAvatarURL } = require('../config/bot-configuration.json');

module.exports = {
    name: Events.GuildMemberRemove,
    once: true,
    execute(member){
        const client = member.client;

        const byeEmbed = new EmbedBuilder()
            .setColor(0x950A0A)
            .setTitle("Szkoda, że nas opuszczasz :(")
            .setAuthor({ name: client.user.username, iconURL: botAvatarURL })
            .setDescription(`${byeMessage}`)
            .setImage(byeMessageImage)
            .setTimestamp()
            .setFooter({ text: `Teraz jest ${member.guild.memberCount} członków na serwerze`, iconURL: member.avatar });

        const channel = client.channels.cache.get(byeChannelID);
        channel.send({ embeds: [byeEmbed] });
    },
};