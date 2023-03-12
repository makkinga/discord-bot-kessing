const {SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js')
const table                                                                = require('text-table')
const config                                                               = require('../config.json')
const dotenv                                                               = require('dotenv')
const {Token, Account, Lang, React}                                        = require('../utils')
dotenv.config()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('See your current balance'),

    async execute(interaction)
    {
        // Defer reply
        await interaction.deferReply({ephemeral: true})

        // Checks
        const account = await Account.address(interaction.user.id)
        if (!await Account.active(account)) {
            return await React.error(interaction, null, Lang.trans(interaction, 'error.title.no_account'), Lang.trans(interaction, 'error.description.no_account'), true)
        }

        const balanceRows  = []
        const tippedRows   = []
        const receivedRows = []
        const burnedRows   = []

        for (const token of config.tokens) {
            const artifact        = await Token.artifact(token)
            const contractAddress = (token === 'JEWEL') ? artifact.bank_address : artifact.address
            const userAddress     = await Account.address(interaction.user.id)

            let balance  = await Account.balance(userAddress, contractAddress)
            let tipped   = await Account.tipped(userAddress, contractAddress)
            let received = await Account.received(userAddress, contractAddress)
            let burned   = await Account.burned(userAddress, contractAddress)
            balanceRows.push([balance, token])
            tippedRows.push([tipped, token])
            receivedRows.push([received, token])
            burnedRows.push([burned, token])
        }

        const toNotification = new EmbedBuilder()
            .setTitle(Lang.trans(interaction, 'balance.title'))
            .setDescription('```' + table(balanceRows) + '```')
            .addFields(
                {name: `Tipped`, value: '```' + table(tippedRows) + '```'},
                {name: `Received`, value: '```' + table(receivedRows) + '```'},
                {name: `Burned`, value: '```' + table(burnedRows) + '```'},
            )
            .setTimestamp()

        const mobileButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(Lang.trans(interaction, 'balance.button_mobile'))
                    .setURL(process.env.DASBBOARD_DEEPLINK_URL)
                    .setStyle('Link')
            )

        const desktopButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(Lang.trans(interaction, 'balance.button_desktop'))
                    .setURL(process.env.DASBBOARD_URL)
                    .setStyle('Link')
            )

        await interaction.editReply({embeds: [toNotification], components: [mobileButton, desktopButton]})
    },
}