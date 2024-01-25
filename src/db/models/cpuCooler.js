const mongoose = require("mongoose");

const CpuCooler = mongoose.model("cpuCooler", {
  manufacture: {
    type: String,
  },
  name: {
    type: String,
  },
  price: {
    type: Number,
  },
  rpm: {
    type: Array,
  },
  noise_level: {
    type: Array,
  },
  color: {
    type: Array,
  },
  size:{
    type:Number,
  },
  type: {
    type: String,
  },
  socket: {
    type: Array,
  },
  tdp: {
    type: Number,
  },
  gid: {
    type: String,
  },
  led: {
    type: Boolean,
  },
});

module.exports = CpuCooler;
