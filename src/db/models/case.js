const mongoose = require("mongoose");

const Case = mongoose.model("case", {
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
  form_factor: {
    type: Array,
  },
  color: {
    type: Array,
  },
  psu: {
    type: Boolean,
  },
  side_panel: {
    type: String,
  },
  external_volume: {
    type: Number,
  },
  internal_35_bays: {
    type: Number,
  },
  gpu_length: {
    type: Number,
  },
  cpu_cooler_length: {
    type: Number,
  },
  fan: {
    type: Array,
  },
  gid: {
    type: String,
  },
});

module.exports = Case;
