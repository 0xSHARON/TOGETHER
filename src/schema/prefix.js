const { Schema, model } = require("mongoose");

const Prefix = new Schema(
  {
    Guild: { type: String, required: true, index: true },
    Prefix: String,
    oldPrefix: String,
  },
  {
    autoIndex: false,
  }
);

module.exports = model("prefix", Prefix);
