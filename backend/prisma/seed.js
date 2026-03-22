const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Запуск сида...')

  const password = await bcrypt.hash('test123', 10)

  // Тестовые пользователи
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password,
      firstName: 'Александра',
      lastName: 'Громова',
      phone: '+7 999 000-00-01',
      role: 'admin',
    },
  })

  const master = await prisma.user.upsert({
    where: { email: 'master@test.com' },
    update: {},
    create: {
      email: 'master@test.com',
      password,
      firstName: 'Наталья',
      lastName: 'Иванова',
      phone: '+7 999 000-00-02',
      role: 'master',
      specialization: 'Вечерние платья и деловые костюмы',
    },
  })

  const master2 = await prisma.user.upsert({
    where: { email: 'master2@test.com' },
    update: {},
    create: {
      email: 'master2@test.com',
      password,
      firstName: 'Светлана',
      lastName: 'Кузнецова',
      phone: '+7 999 000-00-03',
      role: 'master',
      specialization: 'Ремонт и подгонка одежды',
    },
  })

  const client = await prisma.user.upsert({
    where: { email: 'client@test.com' },
    update: {},
    create: {
      email: 'client@test.com',
      password,
      firstName: 'Анна',
      lastName: 'Смирнова',
      phone: '+7 999 000-00-04',
      role: 'client',
    },
  })

  // Услуги
  const services = [
    { name: 'Пошив платья', description: 'Индивидуальный пошив женского платья по меркам', basePrice: 8500, category: 'Пошив', duration: 14 },
    { name: 'Пошив костюма', description: 'Пошив делового костюма (пиджак + брюки)', basePrice: 15000, category: 'Пошив', duration: 21 },
    { name: 'Пошив юбки', description: 'Индивидуальный пошив юбки', basePrice: 4500, category: 'Пошив', duration: 7 },
    { name: 'Пошив блузки', description: 'Пошив блузки по меркам', basePrice: 5000, category: 'Пошив', duration: 10 },
    { name: 'Подгонка пиджака', description: 'Ушив, расширение, подгонка по фигуре', basePrice: 2500, category: 'Ремонт', duration: 5 },
    { name: 'Подгонка брюк', description: 'Ушив по талии, длине, бёдрам', basePrice: 1500, category: 'Ремонт', duration: 3 },
    { name: 'Ремонт молнии', description: 'Замена молнии на одежде', basePrice: 600, category: 'Ремонт', duration: 1 },
    { name: 'Ушив платья', description: 'Подгонка платья по фигуре', basePrice: 2000, category: 'Ремонт', duration: 4 },
  ]

  const createdServices = []
  for (const s of services) {
    const service = await prisma.service.upsert({
      where: { id: services.indexOf(s) + 1 },
      update: {},
      create: s,
    })
    createdServices.push(service)
  }

  // Тестовые заказы
  const ordersData = [
    {
      orderNumber: 'ATL-0001',
      status: 'delivered',
      clientId: client.id,
      masterId: master.id,
      serviceId: createdServices[0].id,
      description: 'Вечернее платье для выпускного, цвет: бордо',
      price: 9200,
      deadline: new Date('2024-01-20'),
      clientComment: 'Хочу с открытой спиной',
      masterComment: 'Выполнено, клиент доволен',
    },
    {
      orderNumber: 'ATL-0002',
      status: 'ready',
      clientId: client.id,
      masterId: master2.id,
      serviceId: createdServices[4].id,
      description: 'Пиджак немного велик в плечах',
      price: 2500,
      deadline: new Date('2024-02-10'),
    },
    {
      orderNumber: 'ATL-0003',
      status: 'in_progress',
      clientId: client.id,
      masterId: master.id,
      serviceId: createdServices[1].id,
      description: 'Деловой костюм серого цвета для собеседования',
      price: 16000,
      deadline: new Date('2025-03-01'),
      clientComment: 'Нужен срочно',
    },
    {
      orderNumber: 'ATL-0004',
      status: 'new',
      clientId: client.id,
      masterId: null,
      serviceId: createdServices[2].id,
      description: 'Летняя юбка, ткань клетка',
      price: null,
      deadline: new Date('2025-03-15'),
    },
  ]

  for (const o of ordersData) {
    await prisma.order.upsert({
      where: { orderNumber: o.orderNumber },
      update: {},
      create: o,
    })
  }

  console.log('✅ Сид выполнен успешно!')
  console.log('')
  console.log('👤 Тестовые пользователи:')
  console.log('   Клиент:        client@test.com  / test123')
  console.log('   Мастер:        master@test.com  / test123')
  console.log('   Администратор: admin@test.com   / test123')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
