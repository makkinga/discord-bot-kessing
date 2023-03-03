const {Sequelize} = require('sequelize')

/* Database */
console.log(1) // REMOVE
console.log({
    'DB_NAME'             : process.env.DB_NAME,
    'DB_USER'             : process.env.DB_USER,
    'DB_PASSWORD'         : process.env.DB_PASSWORD,
    'DB_DIALECT'          : process.env.DB_DIALECT,
    'INSTANCE_UNIX_SOCKET': process.env.INSTANCE_UNIX_SOCKET
}) // REMOVE
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    dialect       : process.env.DB_DIALECT,
    logging       : true,
    dialectOptions: {
        socketPath: process.env.INSTANCE_UNIX_SOCKET
    },
})
console.log(2) // REMOVE
console.log(sequelize) // REMOVE


/**
 * Sync database
 */
exports.syncDatabase = async function () {
    console.log(3) // REMOVE
    await this.nonceCount.sync()
    console.log(4) // REMOVE
    await this.accountHolders.sync()
    await this.pendingGifts.sync()
    await this.pendingGifts.truncate()
    await this.giftCooldown.sync()
    await this.messageCount.sync()
}

/* Nonce counter */
exports.nonceCount = sequelize.define('nonce', {
    name : {
        type     : Sequelize.STRING,
        allowNull: false,
        unique   : true
    },
    nonce: {
        type     : Sequelize.INTEGER,
        allowNull: false,
    },
})

/* Account holders */
exports.accountHolders = sequelize.define('account_holders', {
    user     : {
        type     : Sequelize.STRING,
        allowNull: false,
    },
    address  : {
        type     : Sequelize.STRING,
        allowNull: false,
    },
    role     : {
        type   : Sequelize.BOOLEAN,
        default: false
    },
    show_name: {
        type   : Sequelize.BOOLEAN,
        default: true
    },
    send_dm  : {
        type   : Sequelize.BOOLEAN,
        default: false
    }
})

/* Pending gifts */
exports.pendingGifts = sequelize.define('pending_gifts', {
    author: {
        type     : Sequelize.STRING,
        allowNull: false,
    }
})

/* Gift cooldown */
exports.giftCooldown = sequelize.define('gift_cooldown', {
    user     : {
        type     : Sequelize.STRING,
        allowNull: false,
    },
    command  : {
        type   : Sequelize.BOOLEAN,
        default: false
    },
    claim    : {
        type   : Sequelize.BOOLEAN,
        default: false
    },
    timestamp: {
        type     : Sequelize.INTEGER,
        allowNull: false,
    },
})

/* Message count */
exports.messageCount = sequelize.define('message_count', {
    user : {
        type     : Sequelize.STRING,
        allowNull: false,
    },
    guild: {
        type     : Sequelize.STRING,
        allowNull: false,
    },
    count: {
        type     : Sequelize.INTEGER,
        allowNull: false,
    },
})