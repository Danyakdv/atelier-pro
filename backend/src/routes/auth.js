const router  = require('express').Router()
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const User    = require('../../models/User')
const { auth } = require('../middleware/auth')

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Укажите email и пароль' })

    const user = await User.findOne({ email })
    if (!user)
      return res.status(401).json({ message: 'Неверный email или пароль' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid)
      return res.status(401).json({ message: 'Неверный email или пароль' })

    res.json({ token: generateToken(user), user: user.toSafeObject() })
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body
    if (!email || !password || !firstName || !lastName)
      return res.status(400).json({ message: 'Заполните все обязательные поля' })

    const exists = await User.findOne({ email })
    if (exists)
      return res.status(409).json({ message: 'Пользователь с таким email уже существует' })

    const hashed = await bcrypt.hash(password, 10)
    const user   = await User.create({ email, password: hashed, firstName, lastName, phone, role: 'client' })

    res.status(201).json({ token: generateToken(user), user: user.toSafeObject() })
  } catch (e) {
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' })
    res.json(user.toSafeObject())
  } catch {
    res.status(500).json({ message: 'Ошибка сервера' })
  }
})

module.exports = router
