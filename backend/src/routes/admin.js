const router = require('express').Router()
const bcrypt = require('bcryptjs')
const User   = require('../../models/User')
const Order  = require('../../models/Order')
const { auth, requireRole } = require('../middleware/auth')

router.use(auth, requireRole('admin'))

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const now          = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [total, inProgress, readyToday, revenueResult] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['new', 'in_progress', 'fitting'] } }),
      Order.countDocuments({ status: 'ready', updatedAt: { $gte: startOfDay } }),
      Order.aggregate([
        { $match: { status: { $in: ['ready', 'delivered'] }, createdAt: { $gte: startOfMonth }, price: { $ne: null } } },
        { $group: { _id: null, total: { $sum: '$price' } } },
      ]),
    ])

    res.json({
      total,
      inProgress,
      readyToday,
      revenue: revenueResult[0]?.total || 0,
    })
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

// GET /api/admin/masters-load
router.get('/masters-load', async (req, res) => {
  try {
    const masters = await User.find({ role: 'master' }).select('-password')
    const result  = await Promise.all(masters.map(async m => {
      const activeOrders = await Order.countDocuments({
        master: m._id,
        status: { $in: ['new', 'in_progress', 'fitting'] },
      })
      return {
        id:     m._id,
        name:   `${m.firstName} ${m.lastName}`,
        orders: activeOrders,
        load:   Math.min(Math.round((activeOrders / 8) * 100), 100),
      }
    }))
    res.json(result)
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

// GET /api/admin/masters
router.get('/masters', async (req, res) => {
  try {
    const masters = await User.find({ role: 'master' }).select('-password').sort({ createdAt: 1 })
    const result  = await Promise.all(masters.map(async m => {
      const [activeOrders, completedOrders] = await Promise.all([
        Order.countDocuments({ master: m._id, status: { $in: ['new', 'in_progress', 'fitting'] } }),
        Order.countDocuments({ master: m._id, status: { $in: ['ready', 'delivered'] } }),
      ])
      return { ...m.toObject(), activeOrders, completedOrders }
    }))
    res.json(result)
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

// POST /api/admin/masters
router.post('/masters', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, specialization } = req.body
    if (!email || !password || !firstName || !lastName)
      return res.status(400).json({ message: 'Заполните обязательные поля' })

    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ message: 'Email уже занят' })

    const hashed = await bcrypt.hash(password, 10)
    const master = await User.create({ email, password: hashed, firstName, lastName, phone, specialization, role: 'master' })
    res.status(201).json(master.toSafeObject())
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

// PUT /api/admin/masters/:id
router.put('/masters/:id', async (req, res) => {
  try {
    const { firstName, lastName, phone, specialization } = req.body
    const master = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, phone, specialization },
      { new: true }
    ).select('-password')
    if (!master) return res.status(404).json({ message: 'Мастер не найден' })
    res.json(master)
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

// DELETE /api/admin/masters/:id
router.delete('/masters/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'Мастер удалён' })
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

// GET /api/admin/clients
router.get('/clients', async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' }).select('-password').sort({ createdAt: -1 })
    const result  = await Promise.all(clients.map(async c => {
      const ordersCount = await Order.countDocuments({ client: c._id })
      return { ...c.toObject(), ordersCount }
    }))
    res.json(result)
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

module.exports = router
