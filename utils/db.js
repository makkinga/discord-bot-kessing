const {Sequelize} = require('sequelize')

/* Database */
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    dialect       : process.env.DB_DIALECT,
    logging       : false,
    dialectOptions: {
        socketPath    : process.env.INSTANCE_UNIX_SOCKET,
        connectTimeout: 10000
    },
})

/**
 * Sync database
 */
exports.syncDatabase = async function () {
    await this.nonceCount.sync()
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
