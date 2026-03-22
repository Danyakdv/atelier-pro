require('dotenv').config()
const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')

const authRoutes    = require('./routes/auth')
const ordersRoutes  = require('./routes/orders')
const servicesRoutes = require('./routes/services')
const adminRoutes   = require('./routes/admin')
const masterRoutes  = require('./routes/master')
const clientRoutes  = require('./routes/client')

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/auth',     authRoutes)
app.use('/api/orders',   ordersRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/admin',    adminRoutes)
app.use('/api/master',   masterRoutes)
app.use('/api/client',   clientRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Подключение к MongoDB и запуск сервера
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB подключена')
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`))
  })
  .catch(err => {
    console.error('❌ Ошибка подключения к MongoDB:', err.message)
    process.exit(1)
  })
