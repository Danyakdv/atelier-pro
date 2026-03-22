const router = require('express').Router()
const User   = require('../../models/User')
const Order  = require('../../models/Order')
const { auth, requireRole } = require('../middleware/auth')

router.use(auth, requireRole('client'))

// GET /api/client/orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({ client: req.user.id })
      .populate([{ path: 'service' }, { path: 'master', select: '-password' }])
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

// PUT /api/client/profile
router.put('/profile', async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone },
      { new: true }
    ).select('-password')
    res.json(user)
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

module.exports = router
