const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config();

const Inquiry = require("./models/Inquiry");
const Contact = require("./models/Contact");

const app = express();
app.use(cors({
  origin: "http://localhost:3000"
}));

app.use(bodyParser.json());

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// Routes
app.post("/api/inquiry", async (req, res) => {
  try {
    const newInquiry = new Inquiry(req.body);
    await newInquiry.save();
    res.status(201).json({ message: "Inquiry saved!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/contact", async (req, res) => {
  console.log("Contact request body:", req.body);  // <-- add this
  try {
    const newContact = new Contact(req.body);
    await newContact.save();
    res.status(201).json({ message: "Contact saved!" });
  } catch (err) {
    console.error("Error saving contact:", err); // <-- add this
    res.status(400).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
