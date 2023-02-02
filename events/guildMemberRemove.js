const { Events, EmbedBuilder, ApplicationCommandPermissionType } = require('discord.js');
const byeInfo = require('../config/bye.json');

module.exports = {
    name: Events.GuildMemberRemove,
    once: true,
    execute(member){
        console.log('Serwer opuszczono');
        const client = member.client;

        const byeEmbed = new EmbedBuilder()
            .setColor(0x950A0A)
            .setTitle('Szkoda, że nas opuszczasz :(')
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
            .setDescription(`${member} ${byeInfo.message}`)
            .setImage(byeInfo.messageImage)
            .setTimestamp()
            .setFooter({ text: `Teraz jest ${member.guild.memberCount} członków na serwerze`, iconURL: member.avatar });

        const channel = client.channels.cache.get(byeInfo.channelID);
        channel.send({ embeds: [byeEmbed] });
    },
};