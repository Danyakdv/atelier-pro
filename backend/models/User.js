const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:       { type: String, required: true },
  firstName:      { type: String, required: true, trim: true },
  lastName:       { type: String, required: true, trim: true },
  phone:          { type: String, default: null },
  role:           { type: String, enum: ['admin', 'master', 'client'], default: 'client' },
  specialization: { type: String, default: null }, // только для мастеров
}, { timestamps: true })

// Не отдаём пароль в ответах
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

module.exports = mongoose.model('User', userSchema)
