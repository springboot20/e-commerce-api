const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const AddressSchema = new Schema(
  {
    city: {
      type: String,
      required: true,
      default: '',
    },
    country: {
      type: String,
      required: true,
      default: '',
    },
    address_line_one: {
      type: String,
      required: true,
      default: '',
    },
    firstname: {
      type: String,
      required: true,
      default: '',
    },
    lastname: {
      type: String,
      required: true,
      default: '',
    },
    address_line_two: {
      type: String,
      default: '',
    },
    zipcode: {
      type: Number,
      required: true,
      default: '',
    },
    state: {
      type: String,
      required: true,
      default: '',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    phone: {
      type: String,
      required: true,
      default: '',
    },
  },
  { timestamps: true }
);

const AddressModel = model('Address', AddressSchema);
module.exports = AddressModel;
