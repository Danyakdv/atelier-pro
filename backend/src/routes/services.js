const router  = require('express').Router()
const Service = require('../../models/Service')
const { auth, requireRole } = require('../middleware/auth')

// GET /api/services
router.get('/', auth, async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ category: 1 })
    res.json(services)
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

// POST /api/services
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, description, basePrice, category, duration } = req.body
    if (!name || !basePrice || !category)
      return res.status(400).json({ message: 'Заполните обязательные поля' })

    const service = await Service.create({ name, description, basePrice: Number(basePrice), category, duration: Number(duration) || 7 })
    res.status(201).json(service)
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

// PUT /api/services/:id
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!service) return res.status(404).json({ message: 'Услуга не найдена' })
    res.json(service)
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

// DELETE /api/services/:id — деактивация
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await Service.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ message: 'Услуга деактивирована' })
  } catch { res.status(500).json({ message: 'Ошибка сервера' }) }
})

module.exports = router
