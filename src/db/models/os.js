const mongoose = require('mongoose')

const Os =  mongoose.model('os',{
    name: {
        type:String
    },
    price: {
        type:Number
    },
    mode: {
        type:Number
    },
    max_memory:{
        type: Number
    },
    gid: {
        type: String
    },
    manufacture: {
        type: String
    }
    
})

module.exports = Os;