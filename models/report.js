const mongoose = require('mongoose')
const moment = require('moment')


const report = new mongoose.Schema({
    username: {
        type: String
    },
    reason: {
        type: String
    },
    time: {
        type: String,
        default: moment().format('h:mm a')
    },
    date:{
        type: String,
        default: moment().format("MMM Do YY")
    }
})

module.exports = mongoose.model('Report', report)