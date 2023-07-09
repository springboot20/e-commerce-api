module.exports = (req, res, next) => res.status(404).json({ message: 'Route does not exit' });
