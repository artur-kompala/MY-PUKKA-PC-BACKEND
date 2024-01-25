const mongoose = require("mongoose");

const Gpu = mongoose.model("gpu", {
  name: {
    type: String,
  },
  price: {
    type: Number,
  },
  chipset: {
    type: String,
  },
  memory: {
    type: Number,
  },
  core_clock: {
    type: Number,
  },
  boost_clock: {
    type: Number,
  },
  color: {
    type: Array,
  },
  manufacture: {
    type: String,
  },
  score: {
    type: Number,
  },
  pcie: {
    type: Number,
  },
  rps: {
    type: Number,
  },
  rt: {
    type: Boolean,
  },
  fg: {
    type: String,
  },
  gid: {
    type: String,
  },
  rank: {
    type: Number,
  },
});

module.exports = Gpu;
