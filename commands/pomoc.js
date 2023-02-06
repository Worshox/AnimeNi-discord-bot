const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { inlineCode, hyperlink } = require('discord.js');
const { version } = require('../package.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pomoc')
        .setDescription('Wyświetla wiadomość pomocy z dostępnymi komendami')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const client = interaction.client;
        
        const helpContent = 
        `Witaj ${interaction.user}, oto lista dostępnych komend na serwerze:

            Administracyjne:
                - ${inlineCode('/mute <użytkownik> <czas> [powód]')}
                - ${inlineCode('/kick <użytkownik> [powód]')}
                - ${inlineCode('/ban <użytkownik> [powód]')}
                - ${inlineCode('/unmute <użytkownik>')}
                - ${inlineCode('/unban <użytkownik>')}
            
            Organizacyjne:
                - ${inlineCode('/stworz-regulamin <kanał> <rola>')}
                - ${inlineCode('/edytuj-regulamin')}
                - ${inlineCode('/napisz <kanał> <wiadomość>')}
                - ${inlineCode('/stworz-embeda <kanał>')}
                - ${inlineCode('/stworz-pinga <typ> <użytkownik/kanał/rola>')}
                - ${inlineCode('/konfiguruj-bota [nazwa] [avatar] [aktywność] [szczegóły-aktywności] [status]')}
                - ${inlineCode('/pomoc')}
                
            Pingi odcinków ze strony ${hyperlink('https://animeni.pl/')}:
                - ${inlineCode('/dodaj-ping <rola> <slug>')}
                - ${inlineCode('/usun-ping <rola>')}
                - ${inlineCode('/pokaz-pingi')}
            
            Role reakcji:
                - ${inlineCode('/stworz-grupe-reakcji <nazwa> <kanał>')}
                - ${inlineCode('/usun-grupe-reakcji <nazwa>')}
                - ${inlineCode('/pokaz-grupy-reakcji')}
                - ${inlineCode('/dodaj-role-reakcji <rola> <reakcja> <opis> <grupa>')}
                - ${inlineCode('/usun-role-reakcji <rola>')}
            
            <> - parametr obowiązkowy
            [] - parametr opcjonalny

            Developer: ${client.users.cache.get('621015093815148550')}/Worshox#4561`;

        const footerContent =
        `Wersja bota: ${version} z dnia: 06.02.2023`;

        const helpEmbed = new EmbedBuilder()
            .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
            .setTitle('Pomoc - lista komend')
            .setDescription(helpContent)
            .setColor(0x950A0A)
            .setTimestamp()
            .setFooter({ text: footerContent, iconURL: client.user.displayAvatarURL() });

        await interaction.reply({ embeds: [helpEmbed] });
    },
};