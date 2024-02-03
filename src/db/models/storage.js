const { Double } = require("mongodb");
const mongoose = require("mongoose");

const Storage = mongoose.model("storage", {
  name: {
    type: String,
  },
  price: {
    type: Number,
  },
  capacity: {
    type: Number,
  },
  type: {
    type: String,
  },
  cache: {
    type: Number,
  },
  form_factor: {
    type: String,
  },
  interface: {
    type: String,
  },
  read: {
    type: Number,
  },
  write: {
    type: Number,
  },
  gid: {
    type: String,
  },
  manufacture: {
    type: String,
  },
  score: {
    type: Number
  },
  rank: {
    type: Number
  }
});

module.exports = Storage;
