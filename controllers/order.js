const transactions = require('../middlewares/mongooseTransaction');
const model = require('../models/index');

const getOrder = async (req, res, next) => {
  try {
    const orderDoc = await model.OrderModel.find({ userId: req.params.userId });
    res.status(201).json(orderDoc);
  } catch (error) {
    res.status(500).json(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await model.OrderModel.find();

    res.status(201).json(orders);
  } catch (error) {
    res.status(500).json(error);
  }
};

const placeOrder = transactions(async (req, res, session) => {
  try {
    const orderDoc = await model.OrderModel(req.body);
    const savedOrder = await orderDoc.save({ session });

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json(error);
  }
});

const updateOrder = transactions(async (req, res, session) => {
  const { id } = req.params;

  try {
    const updatedOrderDocument = await model.OrderModel.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    await updatedOrderDocument.save({ session });

    res.status(201).json(updatedOrderDocument);
  } catch (error) {
    res.status(500).json(error);
  }
});

const deleteOrder = async (req, res, next) => {
  const { id } = req.params;
  try {
    await model.OrderModel.findByIdAndDelete(id);
    res.status(201).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json(error);
  }
};

const monthlyIncome = async (req, res, next) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));
  try {
    const orderIncome = await model.OrderModel.aggregate([
      { $match: { createdAt: { $gte: previousMonth } } },
      {
        $project: {
          month: { $month: '$createdAt' },
          sales: '$amount',
        },
      },
      {
        $group: {
          _id: '$month',
          total: { $sum: '$sales' },
        },
      },
    ]);
    res.status(201).json(orderIncome);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  getOrder,
  getOrders,
  placeOrder,
  updateOrder,
  deleteOrder,
  monthlyIncome,
};
