const { SlashCommandBuilder, Events, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { inlineCode } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const cooperationInfo = require('../config/cooperation.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edytuj-wspolpraca')
        .setDescription('Wyświetla formularz pozwalający edytować wiadomość współpracy istniejącą na serwerze')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute(interaction) {
        if (!cooperationInfo.messageID) {
            interaction.reply(`Wiadomość jeszcze nie została stworzona! Możesz ją stworzyć komendą ${inlineCode('/stworz-wspolpraca')}`);
            return;
        }

        const client = interaction.client;

        const modal = new ModalBuilder()
            .setCustomId('editCooperationModal')
            .setTitle('Edytuj współpracę serwera');

        const editCooperationTitleInput = new TextInputBuilder()
            .setCustomId('editCooperationTitleInput')
            .setLabel('Tytuł wiadomości')
            .setStyle(TextInputStyle.Short);

        const editCooperationContentInput = new TextInputBuilder()
            .setCustomId('editCooperationContentInput')
            .setLabel('Treść wiadomości')
            .setStyle(TextInputStyle.Paragraph);

        const editCooperationColourInput = new TextInputBuilder()
            .setCustomId('editCooperationColourInput')
            .setLabel('Kolor paska z boku, heksadecymalnie (bez "#")')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const editCooperationImageInput = new TextInputBuilder()
            .setCustomId('editCooperationImageInput')
            .setLabel('Zdjęcie na dole wiadomości (URL)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        
        const editCooperationFooterInput = new TextInputBuilder()
            .setCustomId('editCooperationFooterInput')
            .setLabel('Zawartość stopki wiadomości')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(editCooperationTitleInput);
        const secondActionRow = new ActionRowBuilder().addComponents(editCooperationContentInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(editCooperationColourInput);
        const forthActionRow = new ActionRowBuilder().addComponents(editCooperationImageInput);
        const fifthActionRow = new ActionRowBuilder().addComponents(editCooperationFooterInput);
        
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, forthActionRow, fifthActionRow);

        interaction.showModal(modal);
        const channel = client.channels.cache.get(cooperationInfo.channelID);

        interaction.client.once(Events.InteractionCreate, async modalInteraction => {
            if (!modalInteraction.isModalSubmit()) return;
            
            if (channel.type != 0){
                modalInteraction.reply('Zły kanał - możesz podać tylko kanał tekstowy.');
                return;
            }

            try {
                const editedcooperationEmbed = new EmbedBuilder()
                    .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL()})
                    .setTitle(modalInteraction.fields.getTextInputValue('editCooperationTitleInput'))
                    .setDescription(modalInteraction.fields.getTextInputValue('editCooperationContentInput'))
                    .setColor(modalInteraction.fields.getTextInputValue('editCooperationColourInput') ? `0x${modalInteraction.fields.getTextInputValue('editCooperationColourInput')}` : cooperationInfo.colour)
                    .setImage(modalInteraction.fields.getTextInputValue('editCooperationImageInput') || null)
                    .setFooter({ text: modalInteraction.fields.getTextInputValue('editCooperationFooterInput') || 'AnimeNi', iconURL: client.user.displayAvatarURL()})

                channel.messages.fetch(cooperationInfo.messageID)
                    .then(async message => {
                        message.edit({ embeds: [editedcooperationEmbed] });
                        cooperationInfo.title = editedcooperationEmbed.data.title;
                        cooperationInfo.content = editedcooperationEmbed.data.description;
                        cooperationInfo.colour = editedcooperationEmbed.data.color;
                        cooperationInfo.image = editedcooperationEmbed.data.image ? editedcooperationEmbed.data.image.url : null;
                        cooperationInfo.footer = editedcooperationEmbed.data.footer.text;
        
                        await modalInteraction.reply(`Wiadomość pomyślnie zedytowano!`);

                        const cooperationFile = path.resolve(__dirname, '../config/cooperation.json');
                        fs.writeFile(cooperationFile, JSON.stringify(cooperationInfo), (error) => {
                            if (error) console.log(error);
                        });
                    });

                // log(`<edytuj-wspolpraca> Użytkownik ${interaction.user.tag} zedytował wiadomość współpracy.`);
            }
            catch (error) {
                await modalInteraction.reply('Nie udało się zedytować wiadomości, najprawdopodobniej popełniłeś błąd w polu "Zdjęcie" (podaj dokładny URL do zdjęcia).');
                return;
            }
        });
    }
}