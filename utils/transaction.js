const dotenv = require('dotenv')
dotenv.config()
const tipperArtifact = require('../artifacts/tipper.json')
const { ethers } = require('ethers')
const getRevertReason = require('eth-revert-reason')
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js')
const Token = require('./token')
const config = require('../config.json')
const { IncomingWebhook } = require('@slack/webhook')
const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL)
const React = require('./react')
const Lang = require('./lang')
const Log = require('./log')
const DB = require('./db')

/**
 * Get nonce
 *
 * @param provider
 * @param signer
 * @returns {Promise<void>}
 */
exports.getNonce = async function (provider, signer) {
    return await provider.getTransactionCount(signer.address, 'pending')

    // let nonce
    // nonce = await DB.nonceCount.findOne({where: {name: 'nonce'}})
    //
    // if (!nonce) {
    //     nonce = await provider.getTransactionCount(signer.address)
    //
    //     await DB.nonceCount.create({
    //         name: 'nonce',
    //         nonce
    //     })
    //
    //     return nonce.nonce
    // }
    //
    // await DB.nonceCount.increment({nonce: 1}, {where: {name: 'nonce'}})
    //
    // return nonce.nonce + 1
}

/**
 * Check gas balance
 *
 * @param provider
 * @param signer
 * @returns {Promise<void>}
 */
async function checkGas(provider, signer) {
    let balance = await provider.getBalance(signer.address)
    balance     = ethers.utils.formatEther(balance)
    if (balance < 10) {
        await webhook.send({
            text: `Help <@U039W35R943>! I'm running low on gas here! Only ${parseFloat(balance).toFixed(2)} JEWEL left before I completely run out!`,
        })
    }
}

/**
 * Make a single transaction
 *
 * @param interaction
 * @param member
 * @param from
 * @param to
 * @param token
 * @param amount
 * @returns {Promise<void>}
 */
exports.make = async function (interaction, member, from, to, token, amount) {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
    const signer = new ethers.Wallet(process.env.BOT_PKEY, provider)
    const nonce = await this.getNonce(provider, signer)
    console.time(`transaction #${nonce}`)
    console.log(`nonce: ${nonce}`)
    const options = {
        maxFeePerGas: 50000000000,
        maxPriorityFeePerGas: 4000000000,
        nonce: nonce,
    }
    const tipperContract = new ethers.Contract(
        tipperArtifact.address,
        tipperArtifact.abi,
        provider,
    )
    const tipper = tipperContract.connect(signer)
    const artifact = await Token.artifact(token)

    await checkGas(provider, signer)

    try {
        const transaction = await tipper.tip(
            from,
            to,
            ethers.utils.parseEther(amount.toString()),
            token === 'JEWEL' ? artifact.bank_address : artifact.address,
            optios,
        )

        await transaction.wait(1)
    } catch (error) {
        // if (error.code === 'TRANSACTION_REPLACED') {
        //     await DB.nonceCount.truncate()
        //     await this.make(interaction, member, from, to, token, amount)
        // } else {
        await Log.error(interaction, 2, error)
        await Log.error(
            interaction,
            2,
            await getRevertReason(error.transaction.hash),
        )

        return await React.error(
            interaction,
            Lang.trans(interaction, 'error.title.error_occurred'),
            null,
            {
                code: 2,
                edit: tru,
            ,
        )
        // }
    }

    if (interaction.commandName !== 'gift') {
        const toNotification = new EmbedBuilder()
            .setTitle('You got tipped!')
            .setDescription(
                `@${interaction.user.username} tipped you ${amount} ${artifact.name} in <#${interaction.channel.id}>`
            )
            .setTimestamp()

        const embed = new EmbedBuilder().setAuthor({
            name: `@${interaction.user.username} tipped @${member.username} ${amount} ${artifact.name}`,
            iconURL: config.token_icons[artifact.name]
        })

        await interaction.editReply({ embeds: [embed] })

        await member.send({ embeds: [toNotification] })
    }

    console.timeEnd(`transaction #${nonce}`)
}

/**
 * Split a transaction
 *
 * @param interaction
 * @param members
 * @param from
 * @param to
 * @param token
 * @param amount
 * @param role
 * @returns {Promise<void>}
 */
exports.split = async function(
    interaction,
    members,
    from,
    to,
    token,
    amount,
    role = null
) {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
    const signer   = new ethers.Wallet(process.env.BOT_PKEY, provider)
    const nonce    = await this.getNonce(provider, signer)
    console.time(`transaction #${nonce}`)
    console.log(`nonce: ${nonce}`)
    const options        = {
        maxFeePerGas        : 50000000000,
        maxPriorityFeePerGas: 4000000000,
        nonce               : nonce
    }
    const tipperContract = new ethers.Contract(
        tipperArtifact.address,
        tipperArtifact.abi,
        provider
    )
    const tipper         = tipperContract.connect(signer)
    const artifact       = await Token.artifact(token)
    await checkGas(provider, signer)
    let transaction

    try {
        transaction = await tipper.tipSplit(
            from,
            to,
            ethers.utils.parseEther(amount.toString()),
            token === 'JEWEL' ? artifact.bank_address : artifact.address,
            options
        )

        await transaction.wait(1)
    } catch (error) {
        // if (error.code === 'TRANSACTION_REPLACED') {
        //     await DB.nonceCount.truncate()
        //     await this.split(interaction, members, from, to, token, amount, role)
        // } else {
        await Log.error(interaction, 3, error)
        await Log.error(
            interaction,
            3,
            await getRevertReason(error.transaction.hash)
        )

        return await React.error(
            interaction,
            Lang.trans(interaction, 'error.title.error_occurred'),
            null,
            {
                code: 3,
                edit: true
            }
        )
        // }
    }

    const rain           = artifact.name === 'CRYSTAL' ? 'Snow' : 'Rain'
    const rained         = artifact.name === 'CRYSTAL' ? 'snowed' : 'rained'
    let hiddenMembers    = 0
    let memberList       = []
    const accountHolders = await DB.accountHolders.findAll({
        where     : {
            user: members.map((m) => m.id)
        },
        attributes: ['user', 'show_name', 'send_dm']
    })

    for (const m of members) {
        const holder = accountHolders.find((h) => h.user === m.id)

        if (holder.show_name) {
            memberList.push(
                `@${m.username.replace('||', '|\u200b|')}#${m.discriminator}`
            )
        } else {
            hiddenMembers++
        }
    }
    const embed = new EmbedBuilder().setAuthor({
        name   :
            `@${interaction.user.username} ${rained} ${amount} ${artifact.name}` +
            (role ? ` on @${role.name}` : ''),
        iconURL: config.token_icons[artifact.name]
    })
    if (hiddenMembers < members.length) {
        embed.setFields({
            name : Lang.trans(interaction, 'rain.users_tipped', {
                amount: `${parseFloat(amount / members.length).toFixed(4)} ${artifact.name}`
            }),
            value: `${memberList.join(', ')}${hiddenMembers > 0 ? ` +${hiddenMembers} others` : ''}`
        })
    }
    const fields = [
        {
            name : Lang.trans(interaction, 'rain.users_tipped', {
                amount: `${parseFloat(amount / members.length).toFixed(4)} ${artifact.name}`
            }),
            value: members
                .map(
                    (m) =>
                        `@${m.username.replace('||', '|\u200b|')}#${m.discriminator}`
                )
                .join('\n ')
        },
        {
            name  : Lang.trans(interaction, 'rain.total_tipped'),
            value : `${amount} ${artifact.name}`,
            inline: true
        },
        {
            name  : Lang.trans(interaction, 'rain.channel'),
            value : `#${interaction.channel.name}`,
            inline: true
        }
    ]
    if (role) {
        fields.push({
            name  : Lang.trans(interaction, 'rain.role'),
            value : `@${role.name}`,
            inline: false
        })
    }

    const receiptEmbed = new EmbedBuilder()
        .setAuthor({
            name   : Lang.trans(interaction, 'rain.receipt_title', { rain }),
            iconURL: config.token_icons[artifact.name]
        })
        .setFields(fields)
        .setTimestamp()

    const explorerLink = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel(Lang.trans(interaction, 'rain.explorer_button'))
            .setURL(
                `https://subnets.avax.network/defi-kingdoms/tx/${transaction.hash}`
            )
            .setStyle('Link')
    )

    await interaction.user.send({
        embeds    : [receiptEmbed],
        components: [explorerLink]
    })

    await interaction.editReply({ embeds: [embed] })

    for (const m of members) {
        const holder = accountHolders.find((h) => h.user === m.id)

        if (holder.send_dm) {
            const toNotification = new EmbedBuilder()
                .setTitle(`You caught the ${rain.toLowerCase()}!`)
                .setDescription(
                    `@${interaction.user.username} tipped you ${parseFloat(amount / members.length).toFixed(4)} ${artifact.name} in <#${interaction.channel.id}>`
                )
                .setTimestamp()

            await m.send({ embeds: [toNotification] })
        }
    }

    console.timeEnd(`transaction #${nonce}`)
}

/**
 * Burn tokens
 *
 * @param interaction
 * @param from
 * @param token
 * @param amount
 * @returns {Promise<void>}
 */
exports.burn = async function (interaction, from, token, amount) {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
    const signer   = new ethers.Wallet(process.env.BOT_PKEY, provider)
    const nonce    = await this.getNonce(provider, signer)
    console.time(`transaction #${nonce}`)
    console.log(`nonce: ${nonce}`)
    const options        = {
        maxFeePerGas        : 50000000000,
        maxPriorityFeePerGas: 4000000000,
        nonce               : nonce
    }
    const tipperContract = new ethers.Contract(
        tipperArtifact.address,
        tipperArtifact.abi,
        provider
    )
    const tipper         = tipperContract.connect(signer)
    const artifact       = await Token.artifact(token)

    try {
        const transaction = await tipper.burn(
            from,
            ethers.utils.parseEther(amount.toString()),
            token === 'JEWEL' ? artifact.bank_address : artifact.address,
            options
        )

        await transaction.wait(1)
    } catch (error) {
        // if (error.code === 'TRANSACTION_REPLACED') {
        //     await DB.nonceCount.truncate()
        //     await this.burn(interaction, from, token, amount)
        // } else {
        await Log.error(interaction, 4, error)
        await Log.error(
            interaction,
            4,
            await getRevertReason(error.transaction.hash)
        )

        return await React.error(
            interaction,
            Lang.trans(interaction, 'error.title.error_occurred'),
            null,
            {
                code: 4,
                edit: true
            }
        )
        // }
    }

    const embed = new EmbedBuilder().setAuthor({
        name   : `@${interaction.user.username} burned ${amount} ${artifact.name} 💀`,
        iconURL: config.token_icons[artifact.name]
    })

    await interaction.editReply({ embeds: [embed] })

    console.timeEnd(`transaction #${nonce}`)
}
