/**
 * Error
 *
 * @param interaction
 * @param code
 * @param error
 */
exports.error = function (interaction, code, error) {
    const reference = `${interaction.user.id.slice(-3)}-${interaction.channelId.slice(-3)}-${interaction.id.slice(-3)}`

    console.error({
        'message'  : `Error E${code.toString().padStart(3, '0')} (${reference}) by user ${interaction.user.id}`,
        'user'     : interaction.user.id,
        'guild'    : interaction.guildId,
        'command'  : interaction.commandName,
        'code'     : `E${code.toString().padStart(3, '0')}`,
        'reference': reference,
        'error'    : error,
    })
}