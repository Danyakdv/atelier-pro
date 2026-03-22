<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="sidebar-logo-text">✦ AtelierPro</div>
      <div class="sidebar-subtitle">{{ roleLabel }}</div>
    </div>

    <nav class="sidebar-nav">
      <template v-for="section in navSections" :key="section.title">
        <div class="nav-section-title">{{ section.title }}</div>
        <div
          v-for="item in section.items"
          :key="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
          @click="router.push(item.path)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          {{ item.label }}
        </div>
      </template>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">{{ initials }}</div>
        <div>
          <div class="user-name">{{ user?.firstName }} {{ user?.lastName }}</div>
          <div class="user-role">{{ roleLabel }}</div>
        </div>
      </div>
      <button class="logout-btn" @click="handleLogout">🚪 Выйти</button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth   = useAuthStore()
const route  = useRoute()
const router = useRouter()

const user = computed(() => auth.user)

const roleLabel = computed(() => ({
  admin:  'Администратор',
  master: 'Мастер-портной',
  client: 'Клиент',
}[user.value?.role] || ''))

const initials = computed(() => {
  const u = user.value
  return u ? (u.firstName?.[0] || '') + (u.lastName?.[0] || '') : '?'
})

const navConfig = {
  admin: [{
    title: 'Управление',
    items: [
      { path: '/admin/dashboard', icon: '📊', label: 'Дашборд' },
      { path: '/admin/orders',    icon: '📋', label: 'Заказы' },
      { path: '/admin/masters',   icon: '🧵', label: 'Мастера' },
      { path: '/admin/clients',   icon: '👥', label: 'Клиенты' },
      { path: '/admin/services',  icon: '🏷',  label: 'Услуги' },
    ],
  }],
  master: [{
    title: 'Работа',
    items: [
      { path: '/master/orders',   icon: '📋', label: 'Мои заказы' },
      { path: '/master/schedule', icon: '📅', label: 'Расписание' },
    ],
  }],
  client: [{
    title: 'Кабинет',
    items: [
      { path: '/client/orders',    icon: '📋', label: 'Мои заказы' },
      { path: '/client/new-order', icon: '➕', label: 'Новый заказ' },
      { path: '/client/profile',   icon: '👤', label: 'Профиль' },
    ],
  }],
}

const navSections = computed(() => navConfig[user.value?.role] || [])

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>
