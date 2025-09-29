const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  interest: { type: String },
  message: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Inquiry", inquirySchema);
