const Table = require('../models/Table');
const handleError = require('../utils/handleError');

// GET /api/tables
async function getTables(req, res) {
  try {
    const tables = await Table.find().sort({ number: 1 });
    return res.status(200).json(tables);
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = { getTables };
