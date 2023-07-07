const transactions = require('../middlewares/mongooseTransaction');
const model = require('../models/index');

const getProduct = async (req, res, next) => {
  const {
    params: { id },
  } = req;
  try {
    const productDoc = await model.ProductModel.findById(id);
    res.status(201).json(productDoc);
  } catch (error) {
    res.status(500).json(error);
  }
};

const getProducts = async (req, res, next) => {
  const {
    query: { new: latest, category },
  } = req;

  try {
    let products;
    if (latest) {
      products = await model.ProductModel.find().sort({ createdAt: -1 }).limit(5);
    } else if (category) {
      products = await model.ProductModel.find({
        categories: {
          $in: [category],
        },
      });
    }

    res.status(201).json(products);
  } catch (error) {
    res.status(500).json(error);
  }
};

const newProduct = transactions(async (req, res, session) => {
  try {
    const productDoc = await model.ProductModel(req.body);
    const savedProduct = await productDoc.save({ session });

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json(error);
  }
});

const updateProduct = transactions(async (req, res, session) => {
  const {
    params: { id },
  } = req;

  try {
    const updatedProductDocument = await model.ProductModel.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    await updatedProductDocument.save({ session });

    res.status(201).json(updatedProductDocument);
  } catch (error) {
    res.status(500).json(error);
  }
});

const deleteProduct = async (req, res, next) => {
  const {
    params: { id },
  } = req;
  try {
    await model.ProductModel.findByIdAndDelete(id);
    res.status(201).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  getProduct,
  getProducts,
  newProduct,
  updateProduct,
  deleteProduct,
};
