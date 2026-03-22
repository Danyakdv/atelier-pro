const mongoose = require('mongoose')

const statusHistorySchema = new mongoose.Schema({
  status:    { type: String, required: true },
  comment:   { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
})

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'fitting', 'ready', 'delivered', 'cancelled'],
    default: 'new',
  },

  client:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  master:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },

  description:   { type: String, default: null },
  measurements:  { type: mongoose.Schema.Types.Mixed, default: null },
  price:         { type: Number, default: null },
  deadline:      { type: Date, default: null },

  clientComment: { type: String, default: null },
  masterComment: { type: String, default: null },

  statusHistory: [statusHistorySchema],
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
