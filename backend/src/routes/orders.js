const router = require('express').Router()
const Order  = require('../../models/Order')
const { auth, requireRole } = require('../middleware/auth')

const POPULATE = [
  { path: 'client',  select: '-password' },
  { path: 'master',  select: '-password' },
  { path: 'service' },
]

// GET /api/orders
router.get('/', auth, async (req, res) => {
  try {
    const filter =
      req.user.role === 'admin'  ? {} :
      req.user.role === 'master' ? { master: req.user.id } :
                                   { client: req.user.id }

    const orders = await Order.find(filter)
      .populate(POPULATE)
      .sort({ createdAt: -1 })

    res.json(orders)
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

// GET /api/orders/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(POPULATE)
    if (!order) return res.status(404).json({ message: 'Заказ не найден' })

    if (req.user.role === 'client' && String(order.client._id) !== req.user.id)
      return res.status(403).json({ message: 'Нет доступа' })
    if (req.user.role === 'master' && String(order.master?._id) !== req.user.id)
      return res.status(403).json({ message: 'Нет доступа' })

    res.json(order)
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

// POST /api/orders — клиент создаёт заказ
router.post('/', auth, requireRole('client', 'admin'), async (req, res) => {
  try {
    const { serviceId, description, measurements, clientComment, deadline } = req.body

    const count       = await Order.countDocuments()
    const orderNumber = `ATL-${String(count + 1).padStart(4, '0')}`

    const order = await Order.create({
      orderNumber,
      client:        req.user.id,
      service:       serviceId,
      description,
      measurements:  measurements || null,
      clientComment: clientComment || null,
      deadline:      deadline ? new Date(deadline) : null,
      status:        'new',
      statusHistory: [{ status: 'new', comment: 'Заказ создан' }],
    })

    await order.populate(POPULATE)
    res.status(201).json(order)
  } catch (e) {
    res.status(500).json({ message: 'Ошибка создания заказа' })
  }
})

// PUT /api/orders/:id — admin или master обновляет
router.put('/:id', auth, requireRole('admin', 'master'), async (req, res) => {
  try {
    const { status, masterId, price, deadline, masterComment } = req.body
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Заказ не найден' })

    if (req.user.role === 'master' && String(order.master) !== req.user.id)
      return res.status(403).json({ message: 'Нет доступа' })

    const prevStatus = order.status

    if (status !== undefined)        order.status        = status
    if (masterId !== undefined)      order.master        = masterId || null
    if (price !== undefined)         order.price         = price ? Number(price) : null
    if (deadline !== undefined)      order.deadline      = deadline ? new Date(deadline) : null
    if (masterComment !== undefined) order.masterComment = masterComment

    if (status && status !== prevStatus) {
      order.statusHistory.push({ status, comment: masterComment || null })
    }

    await order.save()
    await order.populate(POPULATE)
    res.json(order)
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

// DELETE /api/orders/:id — только admin
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id)
    res.json({ message: 'Заказ удалён' })
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

module.exports = router
