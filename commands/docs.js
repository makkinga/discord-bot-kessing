const {
    SlashCommandBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
} = require('discord.js')
const axios = require('axios')
const { Lang } = require('../utils')
const Log = require('../utils/log')
const React = require('../utils/react')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('docs')
        .setDescription('Ask a question about the DFK documentation')
        .addStringOption((option) =>
            option
                .setName('question')
                .setDescription('Ask Kessing your question')
                .setRequired(true),
        ),

    async execute(interaction) {
        // Defer reply
        await interaction.deferReply({ ephemeral: true })

        // Options
        const question = interaction.options.getString('question')

        // Get the answer
        const { docAnswer, devAnswer } = await this.getAnswer(
            interaction,
            question,
        )

        // Reply with error if no answers were found
        if (
            Object.keys(docAnswer.data).length === 0 &&
            docAnswer.data.constructor === Object &&
            Object.keys(devAnswer.data).length === 0 &&
            devAnswer.data.constructor === Object
        ) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('No answers found')
                        .setDescription(
                            'No answers were found for your question. Please try again.,
                        )
                        .setColor('#ff0000')
                        .toJSON(,
                ,
            })
        }

        // Create reply
        const {
            disclaimerEmbed,
            docAnswerEmbed,
            devAnswerEmbed,
            FollowupQuestions
        } = await this.createReply(interaction, question, docAnswer, devAnswer)

        // Send the embed
        if (FollowupQuestions.length) {
            await interaction.editReply({
                embeds: [disclaimerEmbed, docAnswerEmbed, devAnswerEmbed],
                components: [FollowupQuestions]
            })
        } else {
            await interaction.editReply({
                embeds: [disclaimerEmbed, docAnswerEmbed, devAnswerEmbed]
            })
        }

        // Create a collector for followup questions
        const filter = (i) =>
            i.customId.startsWith('followup:') &&
            i.user.id === interaction.user.id
        const collector = interaction.channel.createMessageComponentCollector({
            filter
        })

        collector.on('collect', async (i) => {
            // Defer reply
            await i.deferReply({ ephemeral: true })

            // Get the followup question
            const followup = i.customId.split(':')[1]

            // Get the answer
            const { docAnswer, devAnswer } = await this.getAnswer(i, followup)

            // Reply with error if no answers were found
            if (
                Object.keys(docAnswer.data).length === 0 &&
                docAnswer.data.constructor === Object &&
                Object.keys(devAnswer.data).length === 0 &&
                devAnswer.data.constructor === Object
            ) {
                return await i.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('No answers found')
                            .setDescription(
                                'No answers were found for your question. Please try again.'
                            )
                            .setColor('#ff0000')
                            .toJSON()
                    ]
                })
            }

            // Create reply
            const { docAnswerEmbed, devAnswerEmbed, FollowupQuestions } =
                await this.createReply(i, followup, docAnswer, devAnswer)

            // Send the embed
            if (FollowupQuestions.length) {
                await i.editReply({
                    embeds: [docAnswerEmbed, devAnswerEmbed],
                    components: [FollowupQuestions]
                })
            } else {
                await i.editReply({ embeds: [docAnswerEmbed, devAnswerEmbed] })
            }
        })
    },

    /**
     * Get the answer from the GitBook API
     *
     * @param interaction
     * @param question
     * @returns {Promise<{docAnswer: axios.AxiosResponse<any>, devAnswer: axios.AxiosResponse<any>}>}
     */
    async getAnswer(interaction, question) {
        let docAnswer
        let devAnswer
        try {
            docAnswer = await axios.post(
                'https://api.gitbook.com/v1/spaces/-MfUam-1n-JpNfAIQQey/search/ask',
                {
                    query: question
                }
            )
            devAnswer = await axios.post(
                'https://api.gitbook.com/v1/spaces/lZLlRJsOJCqm10zUsKr6/search/ask',
                {
                    query: question
                }
            )
        } catch (error) {
            await Log.error(interaction, 7, error)

            return await React.error(
                interaction,
                Lang.trans(interaction, 'error.title.error_occurred'),
                null,
                {
                    code: 7,
                    edit: true
                }
            )
        }

        return { docAnswer, devAnswer }
    },

    /**
     * Create the reply
     *
     * @param interaction
     * @param question
     * @param docAnswer
     * @param devAnswer
     * @returns {Promise<{disclaimerEmbed: EmbedBuilder, FollowupQuestions: ActionRowBuilder<AnyComponentBuilder>, devAnswerEmbed: EmbedBuilder, docAnswerEmbed: EmbedBuilder}>}
     */
    async createReply(interaction, question, docAnswer, devAnswer) {
        // Create a disclaimer embed
        const disclaimerEmbed = new EmbedBuilder()
            .setColor('Yellow')
            .setTitle('⚠️ Disclaimer')
            .setDescription(
                'Please note that this AI generated answer may be incorrect or outdated. Always verify any information before making financial decisions.'
            )

        // Create the doc answer embed
        let docAnswerEmbed
        if (
            Object.keys(docAnswer.data).length === 0 &&
            docAnswer.data.constructor === Object
        ) {
            docAnswerEmbed = new EmbedBuilder()
                .setTitle(question)
                .setDescription('No answer found in the documentation.')
                .setFooter({ text: 'Source: docs.defikingdoms.com' })
        } else {
            docAnswerEmbed = new EmbedBuilder()
                .setTitle(question)
                .setDescription(docAnswer.data.answer.text.slice(0, 1521))
                .setFooter({ text: 'Source: docs.defikingdoms.com' })
        }

        // Create the dev answer embed
        let devAnswerEmbed
        if (
            Object.keys(devAnswer.data).length === 0 &&
            devAnswer.data.constructor === Object
        ) {
            devAnswerEmbed = new EmbedBuilder()
                .setTitle(question)
                .setDescription('No answer found in the devs documentation.')
                .setFooter({ text: 'Source: devs.defikingdoms.com' })
        } else {
            devAnswerEmbed = new EmbedBuilder()
                .setTitle(question)
                .setDescription(devAnswer.data.answer.text.slice(0, 1521))
                .setFooter({ text: 'Source: devs.defikingdoms.com' })
        }

        // Create a button for the first 3 followup questions
        const FollowupQuestions = new ActionRowBuilder()
        if (!docAnswer.data === {}) {
            for (const followup of docAnswer.data.answer.followupQuestions) {
                const button = new ButtonBuilder()
                    .setLabel(followup)
                    .setStyle('Primary')
                    .setCustomId(`followup:${followup}`)

                FollowupQuestions.addComponents(button)
            }
        }
        if (!devAnswer.data === {}) {
            for (const followup of devAnswer.data.answer.followupQuestions) {
                const button = new ButtonBuilder()
                    .setLabel(followup)
                    .setStyle('Primary')
                    .setCustomId(`followup:${followup}`)

                FollowupQuestions.addComponents(button)
            }
        }

        return {
            disclaimerEmbed,
            docAnswerEmbed,
            devAnswerEmbed,
            FollowupQuestions
        }
    },
}
