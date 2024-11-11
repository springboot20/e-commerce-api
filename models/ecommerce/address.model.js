const mongoose = require('mongoose');
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
    address_line_one: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    address_line_two: {
      type: String,
    },
    zipcode: {
      type: Number,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    phone: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const AddressModel = model('Address', AddressSchema);
module.exports = AddressModel;
