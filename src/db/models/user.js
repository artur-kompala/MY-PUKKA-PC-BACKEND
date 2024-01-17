const mongoose = require('mongoose')

const User = mongoose.model('user',{
    email: {
        type:String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    cart: {
        type: Array,
        require: false
    }
});

module.exports = User;