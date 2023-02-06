const { SlashCommandBuilder, Events, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { inlineCode } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const reactionRoles = require('../config/reaction-roles.json');
const { log } = require('../logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stworz-grupe-reakcji')
        .setDescription('Stwórz embeda i grupę do ról reakcji')
        .addStringOption(option => option
            .setName('nazwa')
            .setDescription('Unikalna nazwa dla grupy roli reakcji (na potrzeby bota, bez polskich znaków)')
            .setRequired(true))
        .addChannelOption(option => option
            .setName('kanał')
            .setDescription('Kanał, na którym będzie wiadomość z rolami reakcji')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const client = interaction.client;
        const groupName = interaction.options.getString('nazwa');
        const channel = interaction.options.getChannel('kanał');

        if (groupName in reactionRoles) {
            await interaction.reply('Już istnieje grupa roli reakcji o takiej nazwie, wymyśl inną.');
            return;
        }

        const modal = new ModalBuilder()
            .setCustomId('reactionRoleModal')
            .setTitle('Stwórz grupę roli reakcji');

        const reactionRoleTitleInput = new TextInputBuilder()
            .setCustomId('reactionRoleTitleInput')
            .setLabel('Tytuł embeda')
            .setStyle(TextInputStyle.Short);

        const reactionRoleColourInput = new TextInputBuilder()
            .setCustomId('reactionRoleColourInput')
            .setLabel('Kolor paska embeda, heksadecymalnie (bez "#")')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const reactionRoleImageInput = new TextInputBuilder()
            .setCustomId('reactionRoleImageInput')
            .setLabel('Zdjęcie na dole embeda (URL)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        
        const reactionRoleFooterInput = new TextInputBuilder()
            .setCustomId('reactionRoleFooterInput')
            .setLabel('Zawartość stopki embeda')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(reactionRoleTitleInput);
        const secondActionRow = new ActionRowBuilder().addComponents(reactionRoleColourInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(reactionRoleImageInput);
        const forthActionRow = new ActionRowBuilder().addComponents(reactionRoleFooterInput);
        
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, forthActionRow);

        interaction.showModal(modal);

        interaction.client.once(Events.InteractionCreate, async modalInteraction => {
            if (!modalInteraction.isModalSubmit()) return;
            
            if (channel.type !== 0){
                modalInteraction.reply('Zły kanał - możesz podać tylko kanał tekstowy.');
                return;
            }

            try {
                const reactionRoleEmbed = new EmbedBuilder()
                    .setAuthor({ name: client.user.username, iconURL:client.user.displayAvatarURL()})
                    .setTitle(modalInteraction.fields.getTextInputValue('reactionRoleTitleInput'))
                    .setDescription('Nie dodano jeszcze ról')
                    .setColor(modalInteraction.fields.getTextInputValue('reactionRoleColourInput') ? `0x${modalInteraction.fields.getTextInputValue('reactionRoleColourInput')}` : 0x950A0A)
                    .setImage(modalInteraction.fields.getTextInputValue('reactionRoleImageInput') || null)
                    .setFooter({ text: modalInteraction.fields.getTextInputValue('reactionRoleFooterInput') || 'AnimeNi', iconURL: client.user.displayAvatarURL()})
                    .setTimestamp();

                const message = await channel.send({ embeds: [reactionRoleEmbed] });

                reactionRoles[groupName] = {
                    "messageID" : message.id,
                    "channelID": channel.id,
                    "title": reactionRoleEmbed.data.title,
                    "colour": reactionRoleEmbed.data.color,
                    "image": reactionRoleEmbed.data.image ? reactionRoleEmbed.data.image.url : null,
                    "footer": reactionRoleEmbed.data.footer.text
                }

                const reactionRolesFile = path.resolve(__dirname, '../config/reaction-roles.json')
                fs.writeFile(reactionRolesFile, JSON.stringify(reactionRoles), (error) => {
                    if (error) console.log(error);
                });

                modalInteraction.reply(`Embeda roli reakcji wysłano na kanał ${channel}! Czas dodać do niego role komendą: ${inlineCode('/dodaj-role-reakcji')}.`);

                log(`<stworz-grupe-reakcji> Użytkownik ${interaction.user.tag} stworzył grupę roli reakcji ${groupName}.`);
            }

            catch (error) {
                console.log(error);
                modalInteraction.reply('Nie udało się stworzyć embeda, najprawdopodobniej popełniłeś błąd w polu "Zdjęcie" (podaj dokładny URL do zdjęcia).');
            } 
        });
    },
};