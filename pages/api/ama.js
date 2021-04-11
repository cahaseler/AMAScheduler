const { model } = require('../../model.json');

export default (req, res) => {
  if (req.method === 'GET') {
    const requestedDate = req.query.date;

    res.status(200).json([
      requestedDate,
      requestedDate,
      requestedDate,
      requestedDate,
      requestedDate,
    ]);
  }
};
