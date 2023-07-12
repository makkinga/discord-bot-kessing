const {EmbedBuilder} = require('discord.js')
const Lang           = require('./lang')

/**
 * Error
 *
 * @param interaction
 * @param code
 * @param title
 * @param description
 * @param options
 * @return {Promise<void>}
 */
exports.error = async function (interaction, title, description = null, options = {}) {
    const reference = `${interaction.user.id.slice(-3)}-${interaction.channelId.slice(-3)}-${interaction.id.slice(-3)}`

    const embed = new EmbedBuilder()
        .setTitle(title)

    if (description !== null) {
        embed.setDescription(description)
    }

    if (options.report ?? false) {
        embed.addFields(
            {name: Lang.trans(interaction, 'error.title.bug_report'), value: Lang.trans(interaction, 'error.description.bug_report', {server: 'https://discord.gg/2CUcKRzCUj'}), inline: false},
        )
    }

    if (options.code ?? false) {
        embed.addFields(
            {name: `Error code`, value: `\`E${options.code.toString().padStart(3, '0')}\``, inline: true},
            {name: `Reference`, value: `\`${reference}\``, inline: true}
        )
    }

    if (options.edit ?? false) {
        await interaction.editReply({embeds: [embed], ephemeral: true})
    } else {
        await interaction.reply({embeds: [embed], ephemeral: true})
    }
}