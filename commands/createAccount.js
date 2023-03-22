const {SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js')
const CryptoJS                                                             = require('crypto-js')
const {Lang, Account, React}                                               = require('../utils')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-account')
        .setDescription('Create an account'),

    async execute(interaction)
    {
        // Defer reply
        await interaction.deferReply({ephemeral: true})

        // Checks
        const address = await Account.address(interaction.user.id)
        if (await Account.canTip(address)) {
            return await React.error(interaction, Lang.trans(interaction, 'create.has_account.title'), Lang.trans(interaction, 'create.has_account.description', {username: `${interaction.user.username}#${interaction.user.discriminator}`, address: `${address.substr(0, 6)}...${address.substr(-4, 4)}`}), {
                edit  : true,
                report: false,
            })
        }

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