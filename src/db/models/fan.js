const mongoose = require("mongoose");

const Fan = mongoose.model("fan", {
  manufacture: {
    type: String,
  },
  name: {
    type: String,
  },
  price: {
    type: Number,
  },
  color: {
    type: String,
  },
  size:{
    type:Number,
  },
  noise: {
    type: Number,
  },
  led: {
    type: Boolean,
  },
  rpm: {
    type: Number,
  },
  flow: {
    type: Number,
  },
  gid: {
    type: String,
  },
  
});

module.exports = Fan;
