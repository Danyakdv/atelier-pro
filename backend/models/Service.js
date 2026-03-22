const mongoose = require('mongoose')

const serviceSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: null },
  basePrice:   { type: Number, required: true },
  category:    { type: String, required: true },
  duration:    { type: Number, default: 7 }, // дней
  isActive:    { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('Service', serviceSchema)
