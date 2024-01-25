const mongoose = require("mongoose");

const Mobo = mongoose.model("mobo", {
  name: {
    type: String,
  },
  price: {
    type: Number,
  },
  socket: {
    type: String,
  },
  form_factor: {
    type: String,
  },
  max_memory: {
    type: Number,
  },
  memory_slots: {
    type: Number,
  },
  color: {
    type: Array,
  },
  manufacture: {
    type: String,
  },
  wifi: {
    type: Boolean,
  },
  memory_speed: {
    type: Array,
  },
  memory_type: {
    type: Array,
  },
  chipset: {
    type: String,
  },
  integrated_graphics_support: {
    type: Boolean,
  },
  pcie: {
    type: Number,
  },
  gid: {
    type: String,
  },
  m2: {
    type: Boolean,
  },
});

module.exports = Mobo;
