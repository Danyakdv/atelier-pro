import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', redirect: '/login' },

  // Auth
  { path: '/login',    component: () => import('@/views/auth/LoginView.vue'),    meta: { guest: true } },
  { path: '/register', component: () => import('@/views/auth/RegisterView.vue'), meta: { guest: true } },

  // Admin
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      { path: '',          redirect: '/admin/dashboard' },
      { path: 'dashboard', component: () => import('@/views/admin/DashboardView.vue') },
      { path: 'orders',    component: () => import('@/views/admin/OrdersView.vue') },
      { path: 'masters',   component: () => import('@/views/admin/MastersView.vue') },
      { path: 'clients',   component: () => import('@/views/admin/ClientsView.vue') },
      { path: 'services',  component: () => import('@/views/admin/ServicesView.vue') },
    ],
  },

  // Master
  {
    path: '/master',
    component: () => import('@/views/master/MasterLayout.vue'),
    meta: { requiresAuth: true, role: 'master' },
    children: [
      { path: '',         redirect: '/master/orders' },
      { path: 'orders',   component: () => import('@/views/master/OrdersView.vue') },
      { path: 'schedule', component: () => import('@/views/master/ScheduleView.vue') },
    ],
  },

  // Client
  {
    path: '/client',
    component: () => import('@/views/client/ClientLayout.vue'),
    meta: { requiresAuth: true, role: 'client' },
    children: [
      { path: '',           redirect: '/client/orders' },
      { path: 'orders',     component: () => import('@/views/client/OrdersView.vue') },
      { path: 'new-order',  component: () => import('@/views/client/NewOrderView.vue') },
      { path: 'profile',    component: () => import('@/views/client/ProfileView.vue') },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) return next('/login')

  if (to.meta.guest && auth.isAuthenticated) {
    const map = { admin: '/admin', master: '/master', client: '/client' }
    return next(map[auth.user.role] || '/login')
  }

  if (to.meta.role && auth.user?.role !== to.meta.role) {
    const map = { admin: '/admin', master: '/master', client: '/client' }
    return next(map[auth.user?.role] || '/login')
  }

  next()
})

export default router
