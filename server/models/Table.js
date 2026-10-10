const mongoose = require('mongoose');
const toJSON = require('../utils/toJSON');

const tableSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true, min: 1 },
  seats: { type: Number, required: true, min: 1, max: 12 },
  location: { type: String, default: 'Main hall' },
});

tableSchema.set('toJSON', toJSON);

module.exports = mongoose.model('Table', tableSchema);
