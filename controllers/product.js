const transactions = require('../middlewares/mongooseTransaction');
const model = require('../model/index');

const newProduct = transactions(async (req, res, session) => {
  try {
    const productDoc = await model.ProductModel(req.body);
    const savedProduct = await productDoc.save({ session });

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = {
  newProduct,
};
