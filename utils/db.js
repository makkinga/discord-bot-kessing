const {Sequelize} = require('sequelize')

/* Database */
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    dialect       : process.env.DB_DIALECT,
    logging       : console.log,
    dialectOptions: {
        socketPath    : process.env.INSTANCE_UNIX_SOCKET,
        connectTimeout: 30000,
        debug         : true,
        trace         : true,
        pool          : {
            max    : 30,
            min    : 0,
            acquire: 30000,
            idle   : 10000
        }
    },
})

try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
} catch (error) {
    console.error('Unable to connect to the database:', error)
}

/**
 * Sync database
 */
exports.syncDatabase = async function () {
    // await this.nonceCount.sync()
    // await this.accountHolders.sync()
    // await this.pendingGifts.sync()
    // await this.pendingGifts.truncate()
    // await this.giftCooldown.sync()
    // await this.messageCount.sync()
    await this.pineConeCounter.sync()
}

/* Debug table */
exports.pineConeCounter = sequelize.define('pine_cone_count', {
    pine_cones: {
        type     : Sequelize.INTEGER,
        allowNull: false,
    },
}, {freezeTableName: true})

// /* Nonce counter */
// exports.nonceCount = sequelize.define('nonce', {
//     name : {
//         type     : Sequelize.STRING,
//         allowNull: false,
//         unique   : true
//     },
//     nonce: {
//         type     : Sequelize.INTEGER,
//         allowNull: false,
//     },
// }, {freezeTableName: true})
//
// /* Account holders */
// exports.accountHolders = sequelize.define('account_holder', {
//     user     : {
//         type     : Sequelize.STRING,
//         allowNull: false,
//     },
//     address  : {
//         type     : Sequelize.STRING,
//         allowNull: false,
//     },
//     role     : {
//         type   : Sequelize.BOOLEAN,
//         default: false
//     },
//     show_name: {
//         type   : Sequelize.BOOLEAN,
//         default: true
//     },
//     send_dm  : {
//         type   : Sequelize.BOOLEAN,
//         default: false
//     }
// })
//
// /* Pending gifts */
// exports.pendingGifts = sequelize.define('pending_gift', {
//     author: {
//         type     : Sequelize.STRING,
//         allowNull: false,
//     }
// })
//
// /* Gift cooldown */
// exports.giftCooldown = sequelize.define('gift_cooldown', {
//     user     : {
//         type     : Sequelize.STRING,
//         allowNull: false,
//     },
//     command  : {
//         type   : Sequelize.BOOLEAN,
//         default: false
//     },
//     claim    : {
//         type   : Sequelize.BOOLEAN,
//         default: false
//     },
//     timestamp: {
//         type     : Sequelize.INTEGER,
//         allowNull: false,
//     },
// })
//
// /* Message count */
// exports.messageCount = sequelize.define('message_count', {
//     user : {
//         type     : Sequelize.STRING,
//         allowNull: false,
//     },
//     guild: {
//         type     : Sequelize.STRING,
//         allowNull: false,
//     },
//     count: {
//         type     : Sequelize.INTEGER,
//         allowNull: false,
//     },
// }, {freezeTableName: true})
