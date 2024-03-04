const { Sequelize } = require('sequelize')

/* Database */
const sequelize = new Sequelize(
    process.env.DB_DATABASE,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        logging: false,
    },
)

/**
 * Sync database
 */
exports.syncDatabase = async function () {
    try {
        await sequelize.authenticate()
        console.log('Database connection has been established successfully')
    } catch (error) {
        console.error('Unable to connect to the database:', error)
    }

    await sequelize.sync({ alter: false })
    await this.pendingGifts.truncate()
}

/* Nonce counter */
exports.nonceCount = sequelize.define(
    'nonce',
    {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        },
        nonce: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
    },
    { freezeTableName: true },
)

/* Account holders */
exports.accountHolders = sequelize.define('account_holder', {
    user: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    address: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    role: {
        type: Sequelize.BOOLEAN,
        default: false,
    },
    show_name: {
        type: Sequelize.BOOLEAN,
        default: true,
    },
    send_dm: {
        type: Sequelize.BOOLEAN,
        default: false,
    },
})

/* Pending gifts */
exports.pendingGifts = sequelize.define('pending_gift', {
    author: {
        type: Sequelize.STRING,
        allowNull: false,
    },
})

/* Gift cooldown */
exports.giftCooldown = sequelize.define('gift_cooldown', {
    user: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    command: {
        type: Sequelize.BOOLEAN,
        default: false,
    },
    claim: {
        type: Sequelize.BOOLEAN,
        default: false,
    },
    timestamp: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
})

/* Message count */
exports.messageCount = sequelize.define(
    'message_count',
    {
        user: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        guild: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        count: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
    },
    { freezeTableName: true },
)
