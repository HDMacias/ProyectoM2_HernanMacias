// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Error genérico de base de datos
  if (err.code && err.code.startsWith('22') || err.code === '42703') {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  res.status(500).json({ error: 'Internal server error' });
};

module.exports = errorHandler;
