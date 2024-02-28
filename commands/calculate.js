const {SlashCommandBuilder, EmbedBuilder} = require('discord.js')
const {Token}                             = require('../utils')
const axios                               = require('axios')
const dotenv                              = require('dotenv')
dotenv.config()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('calculate')
        .setDescription('Calculate the value of your tokens')
        .addNumberOption(option => option.setRequired(true).setName('amount').setDescription('Enter the amount'))
        .addStringOption(option => option.setRequired(true).setName('of').setDescription('Select a token').addChoices(
            {name: 'CRYSTAL', value: 'CRYSTAL'},
            {name: 'JEWEL', value: 'JEWEL'},
            {name: 'JADE', value: 'JADE'},
        ))
        .addStringOption(option => option.setRequired(true).setName('in').setDescription('Select a currency').addChoices(
            {name: '$', value: 'usd'},
            {name: '€', value: 'eur'},
            {name: '£', value: 'gbp'},
        )),

    async execute(interaction) {
        // Defer reply
        await interaction.deferReply({ephemeral: false})

        // Options
        let amount     = interaction.options.getNumber('amount')
        const token    = interaction.options.getString('of')
        const currency = interaction.options.getString('in')

        // Currency symbols
        const tokenSymbols    = {
            JEWEL  : 'JEWEL',
            CRYSTAL: 'CRYSTAL',
            JADE   : 'JADE',
        }
        const tokenIcons      = {
            JEWEL  : 'https://storageapi2.fleek.co/ed2319ff-1320-4572-a9c4-278c4d80b634-bucket/dfk/logo_jewel.png',
            CRYSTAL: 'https://storageapi2.fleek.co/ed2319ff-1320-4572-a9c4-278c4d80b634-bucket/dfk/logo_crystal.png',
            JADE   : 'https://storage.fleek.zone/ed2319ff-1320-4572-a9c4-278c4d80b634-bucket/dfk/logo_jade.png',
        }
        const currencySymbols = {
            usd: '$:price',
            eur: '€:price',
            gbp: '£:price',
        }

        // Get data
        let value = 0
        if (token === 'JEWEL') {
            const jewelInfo = await Token.jewelInfo()
            value           = parseFloat(jewelInfo.priceUsd)
        } else if (token === 'CRYSTAL') {
            const crystalInfo = await Token.crystalInfo()
            value             = parseFloat(crystalInfo.priceUsd)
        } else if (token === 'JADE') {
            const jadeInfo = await Token.jadeInfo()
            value          = parseFloat(jadeInfo.priceUsd)
        }

        const rates = await axios(`https://api.freecurrencyapi.com/v1/latest?apikey=${process.env.CURRENCY_API_KEY}`)

        switch (currency) {
            case 'eur' :
                value = parseFloat(value * rates.data.data.EUR).toFixed(6)
                break
            case 'gbp' :
                value = parseFloat(value * rates.data.data.GBP).toFixed(6)
                break
        }

        value  = new Intl.NumberFormat().format(parseFloat(value * amount))
        amount = new Intl.NumberFormat().format(parseFloat(amount))

        // Reply
        const embed = new EmbedBuilder()
            .setAuthor({name: tokenSymbols[token], iconURL: tokenIcons[token]})
            .setDescription(`${amount} ${tokenSymbols[token]} ≈ ${currencySymbols[currency].replace(':price', value)}`)

        await interaction.editReply({embeds: [embed]})
    },
}
