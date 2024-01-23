const mongoose = require('mongoose')

const Cpu =  mongoose.model('cpu',{
    name: {
        type:String
    },
    manufacture:{
        type: String
    },
    process:{
        type:String
    },
    socket:{
        type: String
    },
    core_family:{
        type: String
    },
    smt: {
        type:Boolean
    },
    graphics: {
        type:String
    },
    tdp: {
        type:Number
    },
    pbp:{
        type: Number
    },
    core_clock: {
        type:Number
    },
    boost_clock: {
        type:Number
    },
    core_count: {
        type:Number
    },
    price: {
        type:Number
    },
    pcie: {
        type:Number
    },
    chipset:{
        type:Array
    },
    memory_type:{
        type:Array
    },
    benchmark:{
        type: Number
    },
    smaples:{
        type: Number
    },
    rank:{
        type: Number
    },
    gid: {
        type: String
    },
    
})

module.exports = Cpu;