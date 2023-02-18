const { SlashCommandBuilder, Events, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { inlineCode } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const crewInfo = require('../config/crew.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edytuj-ekipa')
        .setDescription('Wyświetla formularz pozwalający edytować wiadomość ekipy istniejącą na serwerze')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute(interaction) {
        if (!crewInfo.messageID) {
            interaction.reply(`Wiadomość jeszcze nie została stworzona! Możesz ją stworzyć komendą ${inlineCode('/stworz-ekipa')}`);
            return;
        }

        const client = interaction.client;

        const modal = new ModalBuilder()
            .setCustomId('editCrewModal')
            .setTitle('Edytuj ekipę serwera');

        const editCrewTitleInput = new TextInputBuilder()
            .setCustomId('editCrewTitleInput')
            .setLabel('Tytuł wiadomości')
            .setStyle(TextInputStyle.Short);

        const editCrewContentInput = new TextInputBuilder()
            .setCustomId('editCrewContentInput')
            .setLabel('Treść wiadomości')
            .setStyle(TextInputStyle.Paragraph);

        const editCrewColourInput = new TextInputBuilder()
            .setCustomId('editCrewColourInput')
            .setLabel('Kolor paska z boku, heksadecymalnie (bez "#")')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const editCrewImageInput = new TextInputBuilder()
            .setCustomId('editCrewImageInput')
            .setLabel('Zdjęcie na dole wiadomości (URL)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        
        const editCrewFooterInput = new TextInputBuilder()
            .setCustomId('editCrewFooterInput')
            .setLabel('Zawartość stopki wiadomości')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(editCrewTitleInput);
        const secondActionRow = new ActionRowBuilder().addComponents(editCrewContentInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(editCrewColourInput);
        const forthActionRow = new ActionRowBuilder().addComponents(editCrewImageInput);
        const fifthActionRow = new ActionRowBuilder().addComponents(editCrewFooterInput);
        
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, forthActionRow, fifthActionRow);

        interaction.showModal(modal);
        const channel = client.channels.cache.get(crewInfo.channelID);

        interaction.client.once(Events.InteractionCreate, async modalInteraction => {
            if (!modalInteraction.isModalSubmit()) return;
            
            if (channel.type != 0){
                modalInteraction.reply('Zły kanał - możesz podać tylko kanał tekstowy.');
                return;
            }

            try {
                const editedcrewEmbed = new EmbedBuilder()
                    .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL()})
                    .setTitle(modalInteraction.fields.getTextInputValue('editCrewTitleInput'))
                    .setDescription(modalInteraction.fields.getTextInputValue('editCrewContentInput'))
                    .setColor(modalInteraction.fields.getTextInputValue('editCrewColourInput') ? `0x${modalInteraction.fields.getTextInputValue('editCrewColourInput')}` : crewInfo.colour)
                    .setImage(modalInteraction.fields.getTextInputValue('editCrewImageInput') || null)
                    .setFooter({ text: modalInteraction.fields.getTextInputValue('editCrewFooterInput') || 'AnimeNi', iconURL: client.user.displayAvatarURL()})

                channel.messages.fetch(crewInfo.messageID)
                    .then(async message => {
                        message.edit({ embeds: [editedcrewEmbed] });
                        crewInfo.title = editedcrewEmbed.data.title;
                        crewInfo.content = editedcrewEmbed.data.description;
                        crewInfo.colour = editedcrewEmbed.data.color;
                        crewInfo.image = editedcrewEmbed.data.image ? editedcrewEmbed.data.image.url : null;
                        crewInfo.footer = editedcrewEmbed.data.footer.text;
        
                        await modalInteraction.reply(`Wiadomość pomyślnie zedytowano!`);

                        const crewFile = path.resolve(__dirname, '../config/crew.json');
                        fs.writeFile(crewFile, JSON.stringify(crewInfo), (error) => {
                            if (error) console.log(error);
                        });
                    });

                // log(`<edytuj-ekipa> Użytkownik ${interaction.user.tag} zedytował wiadomość ekipy.`);
            }
            catch (error) {
                await modalInteraction.reply('Nie udało się zedytować wiadomości, najprawdopodobniej popełniłeś błąd w polu "Zdjęcie" (podaj dokładny URL do zdjęcia).');
                return;
            }
        });
    }
}