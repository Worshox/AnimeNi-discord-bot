const { SlashCommandBuilder, Events, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { inlineCode } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const crewInfo = require('../config/crew.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stworz-ekipa')
        .setDescription('Wyświetla formularz pozwalający stworzyć i wysłać wiadomość o ekipie na określony kanał')
        .addChannelOption(option => option
            .setName('kanał')
            .setDescription('Kanał, na który ma zostać wysłana wiadomosć')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (crewInfo.messageID) {
            await interaction.reply(`Wiadomość już została stworzona! Możesz ją zedytować komendą ${inlineCode('/edytuj-ekipa')}`);
            return;
        }
        
        const client = interaction.client;
        const channel = interaction.options.getChannel('kanał');

        const modal = new ModalBuilder()
            .setCustomId('createCrewModal')
            .setTitle('Stwórz ekipę serwera');

        const createCrewTitleInput = new TextInputBuilder()
            .setCustomId('createCrewTitleInput')
            .setLabel('Tytuł wiadomości')
            .setStyle(TextInputStyle.Short);

        const createCrewContentInput = new TextInputBuilder()
            .setCustomId('createCrewContentInput')
            .setLabel('Treść wiadomości')
            .setStyle(TextInputStyle.Paragraph);

        const createCrewColourInput = new TextInputBuilder()
            .setCustomId('createCrewColourInput')
            .setLabel('Kolor paska z boku, heksadecymalnie (bez "#")')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const createCrewImageInput = new TextInputBuilder()
            .setCustomId('createCrewImageInput')
            .setLabel('Zdjęcie na dole wiadomości (URL)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        
        const createCrewFooterInput = new TextInputBuilder()
            .setCustomId('createCrewFooterInput')
            .setLabel('Zawartość stopki wiadomości')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(createCrewTitleInput);
        const secondActionRow = new ActionRowBuilder().addComponents(createCrewContentInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(createCrewColourInput);
        const forthActionRow = new ActionRowBuilder().addComponents(createCrewImageInput);
        const fifthActionRow = new ActionRowBuilder().addComponents(createCrewFooterInput);
        
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, forthActionRow, fifthActionRow);

        interaction.showModal(modal);

        interaction.client.once(Events.InteractionCreate, async modalInteraction => {
            if (!modalInteraction.isModalSubmit()) return;
            
            if (channel.type !== 0){
                await modalInteraction.reply('Zły kanał - możesz podać tylko kanał tekstowy.');
                return;
            }

            try {
                const crewEmbed = new EmbedBuilder()
                    .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL()})
                    .setTitle(modalInteraction.fields.getTextInputValue('createCrewTitleInput'))
                    .setDescription(modalInteraction.fields.getTextInputValue('createCrewContentInput'))
                    .setColor(modalInteraction.fields.getTextInputValue('createCrewColourInput') ? `0x${modalInteraction.fields.getTextInputValue('createCrewColourInput')}` : 0x950A0A)
                    .setImage(modalInteraction.fields.getTextInputValue('createCrewImageInput') || null)
                    .setFooter({ text: modalInteraction.fields.getTextInputValue('createCrewFooterInput') || 'AnimeNi', iconURL: client.user.displayAvatarURL()})

                const message = await channel.send({ embeds: [crewEmbed] });

                crewInfo.messageID = message.id;
                crewInfo.channelID = message.channel.id;
                crewInfo.title = crewEmbed.data.title;
                crewInfo.content = crewEmbed.data.description;
                crewInfo.colour = crewEmbed.data.color;
                crewInfo.image = crewEmbed.data.image ? crewEmbed.data.image.url : null;
                crewInfo.footer = crewEmbed.data.footer.text;

                await modalInteraction.reply(`Wiadomość ekipy zapisano i wysłano na kanał ${channel}!`);

                const crewFile = path.resolve(__dirname, '../config/crew.json');
                fs.writeFile(crewFile, JSON.stringify(crewInfo), (error) => {
                    if (error) console.log(error);
                });

                // log(`<stworz-ekipa> Użytkownik ${interaction.user.tag} stworzył wiadomość ekipy serwera i wysłał go na kanał ${channel.name}.`);
            }

            catch (error) {
                await modalInteraction.reply('Nie udało się stworzyć wiadomości, najprawdopodobniej popełniłeś błąd w polu "Zdjęcie" (podaj dokładny URL do zdjęcia), lub wystąpił błąd aplikacji.');
                return;
            }
        });
    }
}