const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { Lang, DB } = require('../utils')
const Log = require('../utils/log')
const React = require('../utils/react')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enable-dms')
        .setDescription(
            'Enable or disable direct messages after you caught rain or snow',
        )
        .addBooleanOption((option) =>
            option
                .setReuired(true)
                .setName('enabled')
                .setDescription(
                    'Select whether or not to receive direct messages',
                ),
        ),

    async execute(interaction) {
        // Defer reply
        await interacion.deferReply({ ephemeral: true })

        // Options
        const enabled = interaction.options.getBoolean('enabled')

        // Update database
        try {
            await DB.accountHolders.update(
                { send_dm: enabled },
                { where: { user: interaction.user.id } },
            )
        } catch (error) {
            await Log.error(interaction, 6, error)
            return await React.error(
                interaction,
                Lang.trans(interaction, 'error.title.error_occurred'),
                null,
                {
                    code: 6,
                    edit: tru,
                ,
            )
        }

        // Respond
        const embed = new EmbedBuilder()
            .setTitle(Lang.trans(interaction, 'enable_dms.title'))
            .setDescription(
                Lang.trans(interaction, 'enable_dms.description', {
                    enabled: enabled ? 'enabled' : 'disabled'
                })
            )

        await interaction.editReply({ embeds: [embed] })
    },
}
