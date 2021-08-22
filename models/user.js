const mongoose = require('mongoose')

const user = new mongoose.Schema({
    username: {
        type: String
    },
    password: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('User', user)