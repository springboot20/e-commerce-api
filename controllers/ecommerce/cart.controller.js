const { asyncHandler } = require('../../utils/asyncHandler.js');
const model = require('../../models/index');

const getCart = async (req, res, next) => {
  try {
    const productDoc = await model.CartModel.findOne({ userId: req.params.userId });
    res.status(201).json(productDoc);
  } catch (error) {
    res.status(500).json(error);
  }
};

const getCarts = async (req, res, next) => {
  try {
    const carts = await model.CartModel.find();

    res.status(201).json(carts);
  } catch (error) {
    res.status(500).json(error);
  }
};

const addToCart = asyncHandler(async (req, res) => {
  try {
    const cartDoc = await model.CartModel(req.body);
    const savedCart = await cartDoc.save();

    res.status(201).json(savedCart);
  } catch (error) {
    res.status(500).json(error);
  }
});

const updateCart = asyncHandler(async (req, res) => {
  const {
    params: { id },
  } = req;

  try {
    const updatedCartDocument = await model.CartModel.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    await updatedCartDocument.save();

    res.status(201).json(updatedCartDocument);
  } catch (error) {
    res.status(500).json(error);
  }
});

const deleteCart = async (req, res, next) => {
  const {
    params: { id },
  } = req;
  try {
    await model.CartModel.findByIdAndDelete(id);
    res.status(201).json({ message: 'Cart deleted successfully' });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  getCart,
  getCarts,
  addToCart,
  updateCart,
  deleteCart,
};
