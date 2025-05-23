const mongoose = require('mongoose');

// Schema without strict, since data is dynamic and nested
const wordBankSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('WordBank', wordBankSchema, 'wordbank'); 
// 'wordbank' is the exact MongoDB collection name
