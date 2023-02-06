const { SlashCommandBuilder, Events, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { inlineCode } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const rulesetInfo = require('../config/ruleset.json');
const { log } = require('../logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edytuj-regulamin')
        .setDescription('Wyświetla formularz pozwalający edytować regulamin istniejący na serwerze')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    execute(interaction) {
        if (!rulesetInfo.messageID) {
            interaction.reply(`Regulamin jeszcze nie został stworzony! Możesz go stworzyć komendą ${inlineCode('/stworz-regulamin')}`);
            return;
        }

        const client = interaction.client;

        const modal = new ModalBuilder()
            .setCustomId('editRulesetModal')
            .setTitle('Edytuj regulamin serwera');

        const editRulesetTitleInput = new TextInputBuilder()
            .setCustomId('editRulesetTitleInput')
            .setLabel('Tytuł regulaminu')
            .setStyle(TextInputStyle.Short);

        const editRulesetContentInput = new TextInputBuilder()
            .setCustomId('editRulesetContentInput')
            .setLabel('Treść regulaminu')
            .setStyle(TextInputStyle.Paragraph);

        const editRulesetColourInput = new TextInputBuilder()
            .setCustomId('editRulesetColourInput')
            .setLabel('Kolor paska z boku, heksadecymalnie (bez "#")')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const editRulesetImageInput = new TextInputBuilder()
            .setCustomId('editRulesetImageInput')
            .setLabel('Zdjęcie na dole regulaminu (URL)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        
        const editRulesetFooterInput = new TextInputBuilder()
            .setCustomId('editRulesetFooterInput')
            .setLabel('Zawartość stopki regulaminu')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(editRulesetTitleInput);
        const secondActionRow = new ActionRowBuilder().addComponents(editRulesetContentInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(editRulesetColourInput);
        const forthActionRow = new ActionRowBuilder().addComponents(editRulesetImageInput);
        const fifthActionRow = new ActionRowBuilder().addComponents(editRulesetFooterInput);
        
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, forthActionRow, fifthActionRow);

        interaction.showModal(modal);
        const channel = client.channels.cache.get(rulesetInfo.channelID);

        interaction.client.once(Events.InteractionCreate, async modalInteraction => {
            if (!modalInteraction.isModalSubmit()) return;
            
            if (channel.type != 0){
                modalInteraction.reply('Zły kanał - możesz podać tylko kanał tekstowy.');
                return;
            }

            try {
                const editedRulesetEmbed = new EmbedBuilder()
                    .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL()})
                    .setTitle(modalInteraction.fields.getTextInputValue('editRulesetTitleInput'))
                    .setDescription(modalInteraction.fields.getTextInputValue('editRulesetContentInput'))
                    .setColor(modalInteraction.fields.getTextInputValue('editRulesetColourInput') ? `0x${modalInteraction.fields.getTextInputValue('editRulesetColourInput')}` : rulesetInfo.colour)
                    .setImage(modalInteraction.fields.getTextInputValue('editRulesetImageInput') || null)
                    .setFooter({ text: modalInteraction.fields.getTextInputValue('editRulesetFooterInput') || 'AnimeNi', iconURL: client.user.displayAvatarURL()})

                channel.messages.fetch(rulesetInfo.messageID)
                    .then(message => {
                        message.edit({ embeds: [editedRulesetEmbed] });
                        rulesetInfo.title = editedRulesetEmbed.data.title;
                        rulesetInfo.content = editedRulesetEmbed.data.description;
                        rulesetInfo.colour = editedRulesetEmbed.data.color;
                        rulesetInfo.image = editedRulesetEmbed.data.image ? editedRulesetEmbed.data.image.url : null;
                        rulesetInfo.footer = editedRulesetEmbed.data.footer.text;
        
                        const rulesetFile = path.resolve(__dirname, '../config/ruleset.json');
                        fs.writeFile(rulesetFile, JSON.stringify(rulesetInfo), (error) => {
                            if (error) console.log(error);
                        });
                    });
                modalInteraction.reply(`Regulamin pomyślnie zedytowano!`);

                log(`<edytuj-regulamin> Użytkownik ${interaction.user.tag} zedytował regulamin.`);
            }
            catch (error) {
                modalInteraction.reply('Nie udało się zedytować regulaminu, najprawdopodobniej popełniłeś błąd w polu "Zdjęcie" (podaj dokładny URL do zdjęcia).');
            }
        });
    }
}