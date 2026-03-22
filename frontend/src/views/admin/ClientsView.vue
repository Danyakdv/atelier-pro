<template>
  <div class="page-enter-active">
    <div class="page-header">
      <h1 class="page-title">Клиенты</h1>
      <p class="page-subtitle">База клиентов ателье</p>
    </div>

    <div class="card mb-4">
      <input v-model="search" class="form-input" placeholder="🔍  Поиск по имени, email или телефону..." style="max-width: 380px" />
    </div>

    <div v-if="loading" class="spinner"></div>

    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Клиент</th>
            <th>Email</th>
            <th>Телефон</th>
            <th>Заказов</th>
            <th>Дата регистрации</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="5">
              <div class="empty-state">
                <div class="empty-state-icon">👥</div>
                <div class="empty-state-text">Клиенты не найдены</div>
              </div>
            </td>
          </tr>
          <tr v-for="c in filtered" :key="c.id">
            <td>
              <div class="flex gap-3" style="align-items: center">
                <div class="client-avatar">{{ initials(c) }}</div>
                <span style="font-weight: 500">{{ c.firstName }} {{ c.lastName }}</span>
              </div>
            </td>
            <td class="text-muted">{{ c.email }}</td>
            <td class="text-muted">{{ c.phone || '—' }}</td>
            <td><span class="badge badge-new">{{ c.ordersCount }}</span></td>
            <td class="text-sm text-muted">{{ fmtDate(c.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="apiError" class="alert alert-error mt-4">{{ apiError }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'

const clients  = ref([])
const loading  = ref(true)
const apiError = ref('')
const search   = ref('')

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return clients.value
  return clients.value.filter(c =>
    `${c.firstName} ${c.lastName} ${c.email} ${c.phone || ''}`.toLowerCase().includes(q)
  )
})

onMounted(async () => {
  try {
    const res = await api.get('/admin/clients')
    clients.value = res.data
  } catch {
    apiError.value = 'Ошибка загрузки клиентов'
  } finally {
    loading.value = false
  }
})

function initials(c) { return (c.firstName?.[0] || '') + (c.lastName?.[0] || '') }
function fmtDate(d)  { return d ? new Date(d).toLocaleDateString('ru-RU') : '—' }
</script>

<style scoped>
.client-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--cream); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: var(--charcoal); flex-shrink: 0; }
</style>
