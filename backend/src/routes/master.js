const router = require('express').Router()
const Order  = require('../../models/Order')
const { auth, requireRole } = require('../middleware/auth')

router.use(auth, requireRole('master'))

const POPULATE = [
  { path: 'client',  select: '-password' },
  { path: 'service' },
]

// GET /api/master/orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({ master: req.user.id })
      .populate(POPULATE)
      .sort({ updatedAt: -1 })
    res.json(orders)
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

// GET /api/master/schedule
router.get('/schedule', async (req, res) => {
  try {
    const orders = await Order.find({
      master:   req.user.id,
      status:   { $in: ['new', 'in_progress', 'fitting', 'ready'] },
      deadline: { $ne: null },
    })
      .populate(POPULATE)
      .sort({ deadline: 1 })
    res.json(orders)
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

// PUT /api/master/orders/:id/status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status, masterComment } = req.body
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Заказ не найден' })
    if (String(order.master) !== req.user.id) return res.status(403).json({ message: 'Нет доступа' })

    order.status = status
    if (masterComment !== undefined) order.masterComment = masterComment
    order.statusHistory.push({ status, comment: masterComment || null })

    await order.save()
    await order.populate(POPULATE)
    res.json(order)
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

module.exports = router
