const fs       = require('fs')
const {REST}   = require('@discordjs/rest')
const {Routes} = require('discord-api-types/v10')
const dotenv   = require('dotenv')
dotenv.config()
const clientId = process.env.CLIENT_ID
const guildId  = process.env.GUILD_ID
const token    = process.env.DISCORD_TOKEN

const commands     = []
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    commands.push(command.data.toJSON())
}

const rest = new REST({version: '10'}).setToken(token)

rest.put(Routes.applicationGuildCommands(clientId, guildId), {body: commands})
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error)