// models/Service.js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  howitworks:{type:String},
  whatisService:{type:String},
  whatToExpect:{type:String},
  signs:{type:String},
  handledBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  imageUrl: { type: String }, // Add this field
  createdAt: { type: Date, default: Date.now }
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;