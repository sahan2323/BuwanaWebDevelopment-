// models/Contact.js
const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  interest: String,
  message: String,
}, { timestamps: true });

module.exports = mongoose.model("Contact", ContactSchema);
