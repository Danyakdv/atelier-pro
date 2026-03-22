require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')
const User     = require('../models/User')
const Service  = require('../models/Service')
const Order    = require('../models/Order')

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✅ MongoDB подключена')

  // Очищаем коллекции
  await Promise.all([User.deleteMany(), Service.deleteMany(), Order.deleteMany()])
  console.log('🗑  Коллекции очищены')

  const password = await bcrypt.hash('test123', 10)

  // Пользователи
  const [admin, master, master2, client] = await User.insertMany([
    { email: 'admin@test.com',   password, firstName: 'Александра', lastName: 'Громова',   role: 'admin' },
    { email: 'master@test.com',  password, firstName: 'Наталья',    lastName: 'Иванова',   role: 'master', specialization: 'Вечерние платья и деловые костюмы' },
    { email: 'master2@test.com', password, firstName: 'Светлана',   lastName: 'Кузнецова', role: 'master', specialization: 'Ремонт и подгонка одежды' },
    { email: 'client@test.com',  password, firstName: 'Анна',       lastName: 'Смирнова',  role: 'client', phone: '+7 999 000-00-04' },
  ])
  console.log('👥 Пользователи созданы')

  // Услуги
  const services = await Service.insertMany([
    { name: 'Пошив платья',      description: 'Индивидуальный пошив женского платья по меркам', basePrice: 8500,  category: 'Пошив',   duration: 14 },
    { name: 'Пошив костюма',     description: 'Пошив делового костюма (пиджак + брюки)',        basePrice: 15000, category: 'Пошив',   duration: 21 },
    { name: 'Пошив юбки',        description: 'Индивидуальный пошив юбки',                      basePrice: 4500,  category: 'Пошив',   duration: 7  },
    { name: 'Пошив блузки',      description: 'Пошив блузки по меркам',                         basePrice: 5000,  category: 'Пошив',   duration: 10 },
    { name: 'Подгонка пиджака',  description: 'Ушив, расширение, подгонка по фигуре',           basePrice: 2500,  category: 'Ремонт',  duration: 5  },
    { name: 'Подгонка брюк',     description: 'Ушив по талии, длине, бёдрам',                   basePrice: 1500,  category: 'Ремонт',  duration: 3  },
    { name: 'Ремонт молнии',     description: 'Замена молнии на одежде',                        basePrice: 600,   category: 'Ремонт',  duration: 1  },
    { name: 'Ушив платья',       description: 'Подгонка платья по фигуре',                      basePrice: 2000,  category: 'Ремонт',  duration: 4  },
  ])
  console.log('🏷  Услуги созданы')

  // Заказы
  await Order.insertMany([
    {
      orderNumber:   'ATL-0001',
      status:        'delivered',
      client:        client._id,
      master:        master._id,
      service:       services[0]._id,
      description:   'Вечернее платье для выпускного, цвет: бордо, с открытой спиной',
      price:         9200,
      deadline:      new Date('2024-01-20'),
      clientComment: 'Хочу с открытой спиной',
      masterComment: 'Выполнено, клиент доволен',
      statusHistory: [
        { status: 'new',         comment: 'Заказ создан' },
        { status: 'in_progress', comment: 'Приступила к работе' },
        { status: 'fitting',     comment: 'Готова к примерке' },
        { status: 'ready',       comment: 'Готово!' },
        { status: 'delivered',   comment: 'Выдано клиенту' },
      ],
    },
    {
      orderNumber: 'ATL-0002',
      status:      'ready',
      client:      client._id,
      master:      master2._id,
      service:     services[4]._id,
      description: 'Пиджак немного велик в плечах',
      price:       2500,
      deadline:    new Date('2024-02-10'),
      statusHistory: [
        { status: 'new',         comment: 'Заказ создан' },
        { status: 'in_progress', comment: 'В работе' },
        { status: 'ready',       comment: 'Готово к выдаче' },
      ],
    },
    {
      orderNumber:   'ATL-0003',
      status:        'in_progress',
      client:        client._id,
      master:        master._id,
      service:       services[1]._id,
      description:   'Деловой костюм серого цвета',
      price:         16000,
      deadline:      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // через 14 дней
      clientComment: 'Нужен срочно',
      statusHistory: [
        { status: 'new',         comment: 'Заказ создан' },
        { status: 'in_progress', comment: 'Приступила к работе' },
      ],
    },
    {
      orderNumber: 'ATL-0004',
      status:      'new',
      client:      client._id,
      master:      null,
      service:     services[2]._id,
      description: 'Летняя юбка, ткань клетка',
      deadline:    new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // через 20 дней
      statusHistory: [{ status: 'new', comment: 'Заказ создан' }],
    },
  ])
  console.log('📋 Заказы созданы')

  console.log('')
  console.log('✅ Сид выполнен успешно!')
  console.log('')
  console.log('👤 Тестовые пользователи:')
  console.log('   Клиент:        client@test.com  / test123')
  console.log('   Мастер:        master@test.com  / test123')
  console.log('   Администратор: admin@test.com   / test123')

  await mongoose.disconnect()
}

seed().catch(e => { console.error(e); process.exit(1) })
