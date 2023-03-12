const {SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js')
const CryptoJS                                                             = require('crypto-js')
const {Lang}                                                               = require('../utils')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-account')
        .setDescription('Create an account'),

    async execute(interaction)
    {
        // Defer reply
        await interaction.deferReply({ephemeral: true})

        // Get data
        const id = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(interaction.user.id), process.env.CREATE_ACCOUNT_CYPHER_SECRET).toString()

        // Send embed
        const embed = new EmbedBuilder()
            .setTitle(Lang.trans(interaction, 'create.title'))
            .setDescription(Lang.trans(interaction, 'create.description'))


        const queryString = `?id=${id.replaceAll('+', ':p:').replaceAll('/', ':s:')}`

        const mobileButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(Lang.trans(interaction, 'create.button_mobile'))
                    .setURL(`${process.env.DASBBOARD_DEEPLINK_URL}${queryString}`)
                    .setStyle('Link')
            )

        const desktopButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(Lang.trans(interaction, 'create.button_desktop'))
                    .setURL(`${process.env.DASBBOARD_URL}${queryString}`)
                    .setStyle('Link')
            )

        await interaction.editReply({embeds: [embed], components: [mobileButton, desktopButton]})
    },
}