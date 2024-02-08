const mongoose = require("mongoose");

const Memory = mongoose.model("memory", {
  name: {
    type: String,
  },
  manufacture: {
    type: String,
  },
  price: {
    type: Number,
  },
  type: {
    type: String,
  },
  speed: {
    type: Number,
  },
  module: {
    type: Number,
  },
  capacity: {
    type: Number,
  },
  color: {
    type: String,
  },
  led: {
    type: Boolean,
  },
  tense: {
    type: Number,
  },
  delays: {
    type: Number,
  },
  gid: {
    type: String,
  }
});

module.exports = Memory;
