const transactions = require('../middlewares/mongooseTransaction');
const model = require('../models/index');
const customErrors = require('../errors/customError');

const getProduct = async (req, res, next) => {
  const {
    params: { id },
  } = req;
  try {
    const productDoc = await model.ProductModel.findOne({ _id: id });
    if (!productDoc) throw new customErrors.NotFound(`No product with id : ${id}`);
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

    res.status(201).json({ products, count: products.length });
  } catch (error) {
    res.status(500).json(error);
  }
};

const newProduct = transactions(async (req, res, session) => {
  req.body.user = req.user.userId;
  try {
    const productDoc = await model.ProductModel(req.body);
    const savedProduct = await productDoc.save({ session });

    res.status(201).json({ savedProduct });
  } catch (error) {
    res.status(500).json(error);
  }
});

const updateProduct = async (req, res) => {
  const {
    params: { id },
  } = req;

  try {
    const product = await model.ProductModel.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    if (!product) throw new customErrors.NotFound(`No product with id : ${id}`);

    res.status(201).json({ product });
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteProduct = async (req, res) => {
  const {
    params: { id },
  } = req;
  try {
    const product = await model.ProductModel.findByIdAndDelete(id);
    if (!product) {
      throw new customErrors.NotFound(`No product with id : ${id}`);
    }

    await product.remove();

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
