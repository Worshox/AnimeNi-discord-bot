const { Events, EmbedBuilder } = require('discord.js');
const byeInfo = require('../config/bye.json');
const { log } = require('../logger');

module.exports = {
    name: Events.GuildMemberRemove,
    once: true,
    execute(member){
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

        // log(`Użytkownik ${member.user.tag} opuścił serwer.`);
    },
};