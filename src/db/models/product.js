const mongoose = require('mongoose')

const Product =  mongoose.model('product',{
    gid: {
        type:String
    },
    chart: {
        type: Array
    },
    data: {
        type: Object
    }
})

module.exports = Product;