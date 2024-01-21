const mongoose = require('mongoose')

const Product =  mongoose.model('product',{
    name: {
        type:String
    },
    price: {
        type: Array
    },
    date: {
        type: Array
    },
    data: {
        type: Object
    }
})

module.exports = Product;