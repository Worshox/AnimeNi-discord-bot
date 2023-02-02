const { SlashCommandBuilder, Events, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('stworz-embeda')
    .setDescription('Wyświetla formularz pozwalający wysłać embeda na dany kanał')
    .addChannelOption(option => option
        .setName('kanał')
        .setDescription('Kanał, na który ma zostać wysłana wiadomość')
        .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const channel = interaction.options.getChannel('kanał');
            
        const modal = new ModalBuilder()
            .setCustomId('createEmbedModal')
            .setTitle('Stwórz Embeda');

        const createEmbedTitleInput = new TextInputBuilder()
            .setCustomId('createEmbedTitleInput')
            .setLabel('Tytuł embeda')
            .setStyle(TextInputStyle.Short);

        const createEmbedContentInput = new TextInputBuilder()
            .setCustomId('createEmbedContentInput')
            .setLabel('Treść embeda')
            .setStyle(TextInputStyle.Paragraph);

        const createEmbedColourInput = new TextInputBuilder()
            .setCustomId('createEmbedColourInput')
            .setLabel('Kolor paska embeda, heksadecymalnie (bez "#")')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const createEmbedImageInput = new TextInputBuilder()
            .setCustomId('createEmbedImageInput')
            .setLabel('Zdjęcie na dole embeda (URL)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        
        const createEmbedFooterInput = new TextInputBuilder()
            .setCustomId('createEmbedFooterInput')
            .setLabel('Zawartość stopki embeda')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(createEmbedTitleInput);
        const secondActionRow = new ActionRowBuilder().addComponents(createEmbedContentInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(createEmbedColourInput);
        const forthActionRow = new ActionRowBuilder().addComponents(createEmbedImageInput);
        const fifthActionRow = new ActionRowBuilder().addComponents(createEmbedFooterInput);
        
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, forthActionRow, fifthActionRow);

        interaction.showModal(modal);

        interaction.client.once(Events.InteractionCreate, modalInteraction => {
            if (!modalInteraction.isModalSubmit()) return;
            
            if (channel.type !== 0){
                modalInteraction.reply('Zły kanał - możesz podać tylko kanał tekstowy.');
                return;
            }

            try {
                const customEmbed = new EmbedBuilder()
                    .setAuthor({ name: modalInteraction.user.username, iconURL: modalInteraction.user.avatarURL()})
                    .setTitle(modalInteraction.fields.getTextInputValue('createEmbedTitleInput'))
                    .setDescription(modalInteraction.fields.getTextInputValue('createEmbedContentInput'))
                    .setColor(modalInteraction.fields.getTextInputValue('createEmbedColourInput') ? `0x${modalInteraction.fields.getTextInputValue('createEmbedColourInput')}` : 0x950A0A)
                    .setImage(modalInteraction.fields.getTextInputValue('createEmbedImageInput') || null)
                    .setFooter({ text: modalInteraction.fields.getTextInputValue('createEmbedFooterInput') || 'AnimeNi', iconURL: modalInteraction.user.avatarURL()})
                    .setTimestamp();

                channel.send({ embeds: [customEmbed] });
                modalInteraction.reply(`Embeda wysłano na kanał ${channel}!`);
            }

            catch (error) {
                console.log(error);
                modalInteraction.reply('Nie udało się stworzyć embeda, najprawdopodobniej popełniłeś błąd w polu "Zdjęcie" (podaj dokładny URL do zdjęcia).');
            } 
        });
    }
}