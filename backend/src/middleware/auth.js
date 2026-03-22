const jwt = require('jsonwebtoken')

function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ message: 'Нет токена авторизации' })

  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ message: 'Токен недействителен' })
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role))
      return res.status(403).json({ message: 'Нет доступа' })
    next()
  }
}

module.exports = { auth, requireRole }
