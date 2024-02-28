const {SlashCommandBuilder, EmbedBuilder} = require('discord.js')
const {Lang, Account, React}              = require('../utils')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('account-address')
        .setDescription('Returns the wallet address connected to your tipping account'),

    async execute(interaction) {
        // Defer reply
        await interaction.deferReply({ephemeral: true})

        const address = await Account.address(interaction.user.id)

        // Checks
        if (!address) {
            return await React.error(interaction, Lang.trans(interaction, 'error.title.no_account'), Lang.trans(interaction, 'error.description.no_account'), {
                edit  : true,
                report: false,
            })
        }

        // Send embed
        const embed = new EmbedBuilder()
            .setTitle(Lang.trans(interaction, 'account.title'))
            .setDescription('```' + address + '```')

        await interaction.editReply({embeds: [embed]})
    },
}
