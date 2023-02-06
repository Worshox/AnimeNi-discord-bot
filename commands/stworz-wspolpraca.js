const { SlashCommandBuilder, Events, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { inlineCode } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const cooperationInfo = require('../config/cooperation.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stworz-wspolpraca')
        .setDescription('Wyświetla formularz pozwalający stworzyć i wysłać wiadomość o współpracy na określony kanał')
        .addChannelOption(option => option
            .setName('kanał')
            .setDescription('Kanał, na który ma zostać wysłana wiadomosć')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (cooperationInfo.messageID) {
            await interaction.reply(`Wiadomość już została stworzony! Możesz ją zedytować komendą ${inlineCode('/edytuj-wspolpraca')}`);
            return;
        }
        
        const client = interaction.client;
        const channel = interaction.options.getChannel('kanał');

        const modal = new ModalBuilder()
            .setCustomId('createCooperationModal')
            .setTitle('Stwórz współpracę serwera');

        const createCooperationTitleInput = new TextInputBuilder()
            .setCustomId('createCooperationTitleInput')
            .setLabel('Tytuł wiadomości')
            .setStyle(TextInputStyle.Short);

        const createCooperationContentInput = new TextInputBuilder()
            .setCustomId('createCooperationContentInput')
            .setLabel('Treść wiadomości')
            .setStyle(TextInputStyle.Paragraph);

        const createCooperationColourInput = new TextInputBuilder()
            .setCustomId('createCooperationColourInput')
            .setLabel('Kolor paska z boku, heksadecymalnie (bez "#")')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const createCooperationImageInput = new TextInputBuilder()
            .setCustomId('createCooperationImageInput')
            .setLabel('Zdjęcie na dole wiadomości (URL)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        
        const createCooperationFooterInput = new TextInputBuilder()
            .setCustomId('createCooperationFooterInput')
            .setLabel('Zawartość stopki wiadomości')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(createCooperationTitleInput);
        const secondActionRow = new ActionRowBuilder().addComponents(createCooperationContentInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(createCooperationColourInput);
        const forthActionRow = new ActionRowBuilder().addComponents(createCooperationImageInput);
        const fifthActionRow = new ActionRowBuilder().addComponents(createCooperationFooterInput);
        
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, forthActionRow, fifthActionRow);

        interaction.showModal(modal);

        interaction.client.once(Events.InteractionCreate, async modalInteraction => {
            if (!modalInteraction.isModalSubmit()) return;
            
            if (channel.type !== 0){
                modalInteraction.reply('Zły kanał - możesz podać tylko kanał tekstowy.');
                return;
            }

            try {
                const cooperationEmbed = new EmbedBuilder()
                    .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL()})
                    .setTitle(modalInteraction.fields.getTextInputValue('createCooperationTitleInput'))
                    .setDescription(modalInteraction.fields.getTextInputValue('createCooperationContentInput'))
                    .setColor(modalInteraction.fields.getTextInputValue('createCooperationColourInput') ? `0x${modalInteraction.fields.getTextInputValue('createCooperationColourInput')}` : 0x950A0A)
                    .setImage(modalInteraction.fields.getTextInputValue('createCooperationImageInput') || null)
                    .setFooter({ text: modalInteraction.fields.getTextInputValue('createCooperationFooterInput') || 'AnimeNi', iconURL: client.user.displayAvatarURL()})

                const message = await channel.send({ embeds: [cooperationEmbed] });

                cooperationInfo.messageID = message.id;
                cooperationInfo.channelID = message.channel.id;
                cooperationInfo.title = cooperationEmbed.data.title;
                cooperationInfo.content = cooperationEmbed.data.description;
                cooperationInfo.colour = cooperationEmbed.data.color;
                cooperationInfo.image = cooperationEmbed.data.image ? cooperationEmbed.data.image.url : null;
                cooperationInfo.footer = cooperationEmbed.data.footer.text;

                const cooperationFile = path.resolve(__dirname, '../config/cooperation.json');
                fs.writeFile(cooperationFile, JSON.stringify(cooperationInfo), (error) => {
                    if (error) console.log(error);
                });

                modalInteraction.reply(`Wiadomość zapisano i wysłano na kanał ${channel}!`);

                // log(`<stworz-wspolpraca> Użytkownik ${interaction.user.tag} stworzył wiadomość współpracy serwera i wysłał go na kanał ${channel.name}.`);
            }

            catch (error) {
                console.log(error)
                modalInteraction.reply('Nie udało się stworzyć wiadomości, najprawdopodobniej popełniłeś błąd w polu "Zdjęcie" (podaj dokładny URL do zdjęcia), lub wystąpił błąd aplikacji.');
            }
        });
    }
}