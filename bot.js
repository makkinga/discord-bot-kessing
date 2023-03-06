const fs                                                = require('fs')
const {Client, Collection, GatewayIntentBits, Partials} = require('discord.js')
const dotenv  = require('dotenv')
const {DB, React, Token, Lang, Log, Account}            = require('./utils')
const express = require('express')
const app     = express()
const cors    = require('cors')
const CryptoJS                                          = require('crypto-js')
const {REST}                                            = require('@discordjs/rest')
const {Routes}                                          = require('discord-api-types/v9')
dotenv.config()
const clientId                                          = process.env.CLIENT_ID
const guildId                                           = process.env.GUILD_ID
const token                                             = process.env.DISCORD_TOKEN

/************************************************************/
/* BOT
/************************************************************/

// Create a new client instance
const client = new Client({intents: [GatewayIntentBits.Guilds], partials: [Partials.Channel]})

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Ready!')
})

const commands     = []
client.commands    = new Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.data.name, command)
    commands.push(command.data.toJSON())
}

const rest = new REST({version: '10'}).setToken(token)

rest.put(Routes.applicationGuildCommands(clientId, guildId), {body: commands})
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error)

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return

    await interaction.deferReply()

    const command = client.commands.get(interaction.commandName)

    if (!command) return

    try {
        console.log(`COMMAND INCOMING`)  // REMOVE
        await command.execute(interaction)
    } catch (error) {
        await Log.error(interaction, 1, error)

        return await React.error(interaction, 1, Lang.trans(interaction, 'error.title.general'), Lang.trans(interaction, 'error.description.error_occurred'), true)
    }
})

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN).then(async function () {
    console.log('Connected as:')
    console.log(`${client.user.username} #${client.user.discriminator}`)

    await DB.syncDatabase()
    console.log('Database synced')

    await getTokenInfo()
    await setPresence()
    setInterval(getTokenInfo, 30000)
    setInterval(setPresence, 5000)
    setInterval(async () => await accountRoles(client), 5000)
})

// Set price presence
let jewelPriceUsd,
    jewelPriceChange,
    crystalPriceUsd,
    crystalPriceChange,
    jadePriceUsd,
    jadePriceChange = 0
let presence        = 'jewel'

async function setPresence()
{
    if (presence === 'jewel') {
        await client.user.setPresence({activities: [{name: `1JE at $${jewelPriceUsd} (${jewelPriceChange}%)`, type: 3}]})

        presence = 'crystal'
    } else if (presence === 'crystal') {
        await client.user.setPresence({activities: [{name: `1CR at $${crystalPriceUsd} (${crystalPriceChange}%)`, type: 3}]})

        presence = 'jade'
    } else if (presence === 'jade') {
        await client.user.setPresence({activities: [{name: `1JA at $${jadePriceUsd} (${jadePriceChange}%)`, type: 3}]})

        presence = 'jewel'
    }
}

async function getTokenInfo()
{
    try {
        const jewelInfo   = await Token.jewelInfo()
        const crystalInfo = await Token.crystalInfo()
        const jadeInfo    = await Token.jadeInfo()

        jewelPriceUsd      = parseFloat(jewelInfo.priceUsd).toFixed(3)
        jewelPriceChange   = jewelInfo.priceChange.h24
        crystalPriceUsd    = parseFloat(crystalInfo.priceUsd).toFixed(3)
        crystalPriceChange = crystalInfo.priceChange.h24
        jadePriceUsd       = parseFloat(jadeInfo.priceUsd).toFixed(3)
        jadePriceChange    = jadeInfo.priceChange.h24
    } catch (error) {
        console.warn('Unable to get price')

        jewelPriceUsd, jewelPriceChange, crystalPriceUsd, crystalPriceChange, jadePriceUsd, jadePriceChange = 0
    }
}

async function accountRoles()
{
    const accounts = await DB.accountHolders.findAll({
        where: {
            role: false
        }
    })

    for (const account of accounts) {
        try {
            const role   = client.guilds.cache.get(process.env.GUILD_ID).roles.cache.find(role => role.id === process.env.ACCOUNT_ROLE)
            const member = client.guilds.cache.get(process.env.GUILD_ID).members.cache.find(member => member.id === account.user)
            if (role && member) {
                await member.roles.add(role)
                await account.update({role: true})
            }
        } catch (error) {
            console.log(error)
        }
    }
}

/************************************************************/
/* API
/************************************************************/

app.use(cors())
app.options('*', cors())
// app.use(express.json())

// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow connecting
    res.setHeader('Access-Control-Allow-Origin', '*')

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', '*')

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', '*')

    // Pass to next layer of middleware
    next()
})

app.get('/ping', async function (request, response) {
    response.writeHead(200, {'Content-Type': 'application/json'})
    response.write(JSON.stringify({success: true, message: `pong`}))
    response.end()
})

app.post('/verify-account', async function (request, response) {
    await DB.accountHolders.sync()
    for (const param of ['id', 'address']) {
        if (typeof request.body[param] === 'undefined') {
            response.writeHead(400, {'Content-Type': 'application/json'})
            response.write(JSON.stringify({success: false, message: `Missing parameter "${param}"`}))
            response.end()

            return
        }
    }

    try {
        const id      = await CryptoJS.AES.decrypt(request.body['id'].replaceAll(':p:', '+').replaceAll(':s:', '/'), process.env.CREATE_ACCOUNT_CYPHER_SECRET).toString(CryptoJS.enc.Utf8)
        const address = await request.body['address']

        if (await Account.verified(address)) {
            response.writeHead(403, {'Content-Type': 'application/json'})
            response.write(JSON.stringify({success: false, message: `Account already verified`}))
            response.end()

            return
        }

        await Account.verify(address, id)

        await DB.accountHolders.create({
            user   : id,
            address: address,
            role   : false
        })

        response.writeHead(200, {'Content-Type': 'application/json'})
        response.write(JSON.stringify({success: true, id: id}))
        response.end()
    } catch (error) {
        console.log(error)

        response.writeHead(500, {'Content-Type': 'application/json'})
        response.write(JSON.stringify({success: false, message: `An error occurred`}))
        response.end()
    }
})

const api = app.listen(process.env.PORT, '0.0.0.0', function () {
    const host = api.address().address
    const port = api.address().port
    console.log('Barkeep Kessing API listening at https://%s:%s', host, port)
})
