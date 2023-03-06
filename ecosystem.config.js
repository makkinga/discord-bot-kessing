module.exports = {
    apps: [{
        name        : 'Barkeep Kessing Bot',
        script      : './bot.js',
        ignore_watch: ['logs', 'chartscreens'],
    }, {
        name        : 'Barkeep Kessing API',
        script      : './api.js',
        ignore_watch: ['logs', 'chartscreens'],
    }]
}
