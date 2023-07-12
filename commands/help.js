const {SlashCommandBuilder, ActionRowBuilder, EmbedBuilder, ButtonBuilder} = require('discord.js')
const axios = require('axios')
const {Lang} = require('../utils')
const Log = require('../utils/log')
const React = require('../utils/react')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help using Kessing')
        .addStringOption(option => option.setName('question').setDescription('Ask Kessing your question').setRequired(true)),

    async execute(interaction) {
        // Defer reply
        await interaction.deferReply({ephemeral: true})

        // Options
        const question = interaction.options.getString('question')

        // Get the answer
        const answer = await this.getAnswer(interaction, question)

        // Create reply
        const {disclaimerEmbed, answerEmbed, FollowupQuestions} = await this.createReply(interaction, question, answer)

        // Send the embed
        if (FollowupQuestions.length) {
            await interaction.editReply({embeds: [disclaimerEmbed, answerEmbed], components: [FollowupQuestions]})
        } else {
            await interaction.editReply({embeds: [disclaimerEmbed, answerEmbed]})
        }

        // Create a collector for followup questions
        const filter = i => i.customId.startsWith('followup:') && i.user.id === interaction.user.id
        const collector = interaction.channel.createMessageComponentCollector({filter})

        collector.on('collect', async i => {
            // Defer reply
            await i.deferReply({ephemeral: true})

            // Get the followup question
            const followup = i.customId.split(':')[1]

            // Get the answer
            const answer = await this.getAnswer(i, followup)

            // Create reply
            const {answerEmbed, FollowupQuestions} = await this.createReply(i, followup, answer)

            // Send the embed
            if (FollowupQuestions.length) {
                await i.editReply({embeds: [answerEmbed], components: [FollowupQuestions]})
            } else {
                await i.editReply({embeds: [answerEmbed]})
            }
        })
    },

    /**
     * Get the answer from the GitBook API
     *
     * @param interaction
     * @param question
     * @returns {Promise<axios.AxiosResponse<any>|void>}
     */
    async getAnswer(interaction, question) {
        try {
            return await axios.post('https://api.gitbook.com/v1/spaces/SrNx1aAiTRCGjylKXiu1/search/ask', {
                query: question,
            })
        } catch (error) {
            await Log.error(interaction, 7, error)

            return await React.error(interaction, Lang.trans(interaction, 'error.title.error_occurred'), null, {
                code: 7,
                edit: true
            })
        }
    },

    /**
     * Create the reply
     *
     * @param interaction
     * @param question
     * @param answer
     * @returns {Promise<{disclaimerEmbed: EmbedBuilder, answerEmbed: EmbedBuilder, FollowupQuestions: ActionRowBuilder<AnyComponentBuilder>}>}
     */
    async createReply(interaction, question, answer) {
        // Create a disclaimer embed
        const disclaimerEmbed = new EmbedBuilder()
            .setColor('Yellow')
            .setTitle('⚠️ Disclaimer')
            .setDescription('Please note that this AI generated answer may be incorrect or outdated. Always verify any information before making financial decisions.')

        // Create the answer embed
        const answerEmbed = new EmbedBuilder()
            .setTitle(question)
            .setDescription(answer.data.answer.text.slice(0, 1521))

        // Create a button for the first 3 followup questions
        const FollowupQuestions = new ActionRowBuilder()
        for (const followup of answer.data.answer.followupQuestions) {
            const button = new ButtonBuilder()
                .setLabel(followup)
                .setStyle('Primary')
                .setCustomId(`followup:${followup}`)

            FollowupQuestions.addComponents(button)
        }

        return {disclaimerEmbed, answerEmbed, FollowupQuestions}
    }
}