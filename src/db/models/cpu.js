const mongoose = require('mongoose')

const Cpu =  mongoose.model('cpu',{
    name: {
        type:String
    },
    price: {
        type:Number
    },
    core_count: {
        type:Number
    },
    core_clock: {
        type:Number
    },
    boost_clock: {
        type:Number
    },
    tdp: {
        type:Number
    },
    graphics: {
        type:String
    },
    smt: {
        type:Boolean
    },
    gid: {
        type: String
    },
    manufacture:{
        type: String
    }
})

module.exports = Cpu;