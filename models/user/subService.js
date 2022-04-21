const mongoose = require("mongoose");

let SubServiceSchema = new mongoose.Schema({
  serviceid: { type: String, required: true },
  name: {
    type: String,
    unique: true,
    required: true,
    sparse: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: [String],
    required: true,
    trim: true,
  },
  status: {
    type: Number,
    required: true,
    trim: true,
  },
  ServicePrice: {
    minimum: Number,
    maximum: Number,
  },
  BasePrice: {
    type: Number,
  },
  averageTaskTime: {
    type: String,
  },
  responseWaitTime: {
    Defvalue: String,
    maxvalue: Number,
    jumpvalue: Number,
    default: {},
  },
  Estimatedtime: {
    Defvalue: String,
    estimatedvalue: Number,
    jumpvalue: Number,
    default: {},
  },
  serviceRadius: {
    type: Number,
  },
  peakhours: {
    type: String,
  },
});

const SubService = mongoose.model("SubService", SubServiceSchema);

module.exports = SubService;
