const { SlashCommandBuilder, Events, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { inlineCode } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { messageID } = require('../config/ruleset.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stworz-regulamin')
        .setDescription('Wyświetla formularz pozwalający stworzyć i wysłać regulamin na określony kanał')
        .addChannelOption(option => option
            .setName('kanał')
            .setDescription('Kanał na który ma zostać wysłany regulamin')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        if (messageID) {
            await interaction.reply(`Regulamin już został stworzony! Możesz go zedytować komendą ${inlineCode('/edytuj-regulamin')}`);
            return;
        }

        const client = interaction.client;

        const modal = new ModalBuilder()
            .setCustomId('createRulesetModal')
            .setTitle('Stwórz regulamin serwera');

        const createRulesetTitleInput = new TextInputBuilder()
            .setCustomId('createRulesetTitleInput')
            .setLabel('Tytuł regulaminu')
            .setStyle(TextInputStyle.Short);

        const createRulesetContentInput = new TextInputBuilder()
            .setCustomId('createRulesetContentInput')
            .setLabel('Treść regulaminu')
            .setStyle(TextInputStyle.Paragraph);

        const createRulesetColourInput = new TextInputBuilder()
            .setCustomId('createRulesetColourInput')
            .setLabel('Kolor paska z boku, heksadecymalnie (bez "#")')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const createRulesetImageInput = new TextInputBuilder()
            .setCustomId('createRulesetImageInput')
            .setLabel('Zdjęcie na dole regulaminu (URL)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        
        const createRulesetFooterInput = new TextInputBuilder()
            .setCustomId('createRulesetFooterInput')
            .setLabel('Zawartość stopki regulaminu')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(createRulesetTitleInput);
        const secondActionRow = new ActionRowBuilder().addComponents(createRulesetContentInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(createRulesetColourInput);
        const forthActionRow = new ActionRowBuilder().addComponents(createRulesetImageInput);
        const fifthActionRow = new ActionRowBuilder().addComponents(createRulesetFooterInput);
        
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, forthActionRow, fifthActionRow);

        interaction.showModal(modal);
        const channel = interaction.options.getChannel('kanał');

        interaction.client.once(Events.InteractionCreate, async modalInteraction => {
            if (!modalInteraction.isModalSubmit()) return;
            
            if (channel.type != 0){
                modalInteraction.reply('Zły kanał - możesz podać tylko kanał tekstowy.');
                return;
            }

            try {
                const rulesetEmbed = new EmbedBuilder()
                    .setAuthor({ name: client.user.username, iconURL: client.user.avatarURL()})
                    .setTitle(modalInteraction.fields.getTextInputValue('createRulesetTitleInput'))
                    .setDescription(modalInteraction.fields.getTextInputValue('createRulesetContentInput'))
                    .setColor(modalInteraction.fields.getTextInputValue('createRulesetColourInput') ? `0x${modalInteraction.fields.getTextInputValue('createRulesetColourInput')}` : 0x950A0A)
                    .setImage(modalInteraction.fields.getTextInputValue('createRulesetImageInput') || null)
                    .setFooter({ text: modalInteraction.fields.getTextInputValue('createRulesetFooterInput') || 'AnimeNi', iconURL: client.user.avatarURL()})

                const message = await channel.send({ embeds: [rulesetEmbed] });
                message.react('✅');

                const rulesetInfo = {
                    "messageID": message.id,
                    "channelID": message.channel.id,
                    "title": modalInteraction.fields.getTextInputValue('createRulesetTitleInput'),
                    "content": modalInteraction.fields.getTextInputValue('createRulesetContentInput'),
                    "colour": modalInteraction.fields.getTextInputValue('createRulesetColourInput') ? `0x${modalInteraction.fields.getTextInputValue('createRulesetColourInput')}` : '0x950A0A',
                    "image": modalInteraction.fields.getTextInputValue('createRulesetImageInput') || null,
                    "footer": modalInteraction.fields.getTextInputValue('createRulesetFooterInput') || 'AnimeNi'
                }

                const rulesetFile = path.resolve(__dirname, '../config/ruleset.json');
                fs.writeFile(rulesetFile, JSON.stringify(rulesetInfo), (error) => {
                    if (error) console.log(error);
                });

                modalInteraction.reply(`Regulamin zapisano i wysłano na kanał ${channel.name}!`);
            }

            catch (error) {
                modalInteraction.reply('Nie udało się stworzyć regulaminu, najprawdopodobniej popełniłeś błąd w polu "Zdjęcie" (podaj dokładny URL do zdjęcia)');
            }
        });
    }
}