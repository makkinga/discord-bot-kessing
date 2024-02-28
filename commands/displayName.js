const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { Lang, DB } = require('../utils')
const Log = require('../utils/log')
const React = require('../utils/react')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('display-name')
        .setDescription(
            'Enable or disable displaying your username on rain responses',
        )
        .addBooleanOption((option) =>
            option
                .setReuired(true)
                .setName('enabled')
                .setDescription(
                    'Select whether or not to display your username',
                ),
        ),

    async execute(interaction) {
        // Defer reply
        await interacion.deferReply({ ephemeral: true })

        // Options
        const enabled = interaction.options.getBoolean('enabled')

        // Update database
        try {
            DB.accountHolders.update(
                { show_name: enabled },
                { where: { user: interaction.user.id } },
            )
        } catch (error) {
            await Log.error(interaction, 5, error)
            return await React.error(
                interaction,
                Lang.trans(interaction, 'error.title.error_occurred'),
                null,
                {
                    code: 5,
                    edit: tru,
                ,
            )
        }

        // Respond
        const embed = new EmbedBuilder()
            .setTitle(Lang.trans(interaction, 'display_name.title'))
            .setDescription(
                Lang.trans(interaction, 'display_name.description', {
                    enabled: enabled ? 'enabled' : 'disabled'
                })
            )

        await interaction.editReply({ embeds: [embed] })
    },
}
