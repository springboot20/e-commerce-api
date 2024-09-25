const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const AddressSchema = new Schema(
  {
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    addressLineOne: {
      type: String,
      required: true,
    },
    addressLineTwo: {
      type: String,
    },
    zipCode: {
      type: Number,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    phone: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const AddressModel = model("Address", AddressSchema);
module.exports = AddressModel;
