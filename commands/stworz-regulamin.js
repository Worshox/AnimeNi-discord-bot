const { SlashCommandBuilder, Events, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { inlineCode } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const rulesetInfo = require('../config/ruleset.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stworz-regulamin')
        .setDescription('Wyświetla formularz pozwalający stworzyć i wysłać regulamin na określony kanał')
        .addChannelOption(option => option
            .setName('kanał')
            .setDescription('Kanał, na który ma zostać wysłany regulamin')
            .setRequired(true))
        .addRoleOption(option => option
            .setName('rola')
            .setDescription('Rola, która ma być przyznawana po zaakceptowaniu regulaminu')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        if (rulesetInfo.messageID) {
            await interaction.reply(`Regulamin już został stworzony! Możesz go zedytować komendą ${inlineCode('/edytuj-regulamin')}`);
            return;
        }
        
        const client = interaction.client;
        const channel = interaction.options.getChannel('kanał');
        const role = interaction.options.getRole('rola');

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

        interaction.client.once(Events.InteractionCreate, async modalInteraction => {
            if (!modalInteraction.isModalSubmit()) return;
            
            if (channel.type !== 0){
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

                rulesetInfo.userRoleID = role.id;
                rulesetInfo.messageID = message.id;
                rulesetInfo.channelID = message.channel.id;
                rulesetInfo.title = rulesetEmbed.data.title;
                rulesetInfo.content = rulesetEmbed.data.description;
                rulesetInfo.colour = rulesetEmbed.data.color;
                rulesetInfo.image = rulesetEmbed.data.image ? rulesetEmbed.data.image.url : null;
                rulesetInfo.footer = rulesetEmbed.data.footer.text;

                const rulesetFile = path.resolve(__dirname, '../config/ruleset.json');
                fs.writeFile(rulesetFile, JSON.stringify(rulesetInfo), (error) => {
                    if (error) console.log(error);
                });

                modalInteraction.reply(`Regulamin zapisano i wysłano na kanał ${channel}!`);
            }

            catch (error) {
                console.log(error)
                modalInteraction.reply('Nie udało się stworzyć regulaminu, najprawdopodobniej popełniłeś błąd w polu "Zdjęcie" (podaj dokładny URL do zdjęcia), lub wystąpił błąd aplikacji.');
            }
        });
    }
}