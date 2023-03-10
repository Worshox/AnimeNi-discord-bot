const { SlashCommandBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { bold } = require('discord.js');
const { log } = require('../logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Wycisz użytkownika na serwerze')
        .addUserOption(option => option
            .setName('użytkownik')
            .setDescription(`Użytkownik, którego chcesz wyciszyć`)
            .setRequired(true))
        .addStringOption(option => option
            .setName('czas')
            .setDescription('Na jak długo chcesz wyciszyć użytkownika')
            .setRequired(true)
            .addChoices(
                { name: '1 godzina', value: '3600000' },
                { name: '1 dzień', value: '86400000' },
                { name: '1 tydzień', value: '604800000' },
                { name: '28 dni', value: '2419200000' },
            ))
        .addStringOption(option => option
            .setName('powód')
            .setDescription('Dlaczego wyciszasz tego użytkownika'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction) {
        const client = interaction.client;
        const member = interaction.options.getMember('użytkownik');
        const time = +interaction.options.getString('czas');
        const reason = interaction.options.getString('powód') || 'Nie podano przyczyny';

        let timeInWords;
        switch (time) {
            case 3600000: timeInWords = '1 godzinę'; break;
            case 86400000: timeInWords = '1 dzień'; break;
            case 604800000: timeInWords = '1 tydzień'; break;
            case 2419200000: timeInWords = '28 dni'; break;
        }

            member.timeout(time, reason).catch(error => {
                interaction.reply(`Nie można wyciszyć użytkownika, najprawdopodobniej nie mam odpowiednich uprawnień`);
                return;
            });
        

        if (!member.user.bot) {
            client.users.send(member.id, { content: `Zostałeś wyciszony na serwerze AnimeNi z powodu: ${reason}, na ${timeInWords}` })
                .catch(error => console.log('Nie można wysłać wiadomości do tego użytkownika'));
        }

        await interaction.reply(`${bold('Wyciszono')} użytkownika ${member.user.username} z powodu: ${reason}, na ${timeInWords}`);

        // log(`<mute> Użytkownik ${interaction.user.tag} wyciszył użytkownika ${member.user.tag} z powodu: ${reason}, na ${timeInWords}.`);
    },
};