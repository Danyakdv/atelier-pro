<template>
  <div class="page-enter-active">
    <div class="page-header">
      <h1 class="page-title">Дашборд</h1>
      <p class="page-subtitle">Общая статистика ателье</p>
    </div>

    <div v-if="loading" class="spinner"></div>

    <template v-else>
      <div class="stats-grid">
        <div class="stat-card" v-for="s in stats" :key="s.label">
          <div class="stat-value">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>

      <div class="grid-2" style="gap: 20px; align-items: start">
        <!-- Recent orders -->
        <div class="table-wrap">
          <div class="table-header">
            <h3 class="table-title">Последние заказы</h3>
            <router-link to="/admin/orders" class="btn btn-ghost btn-sm">Все →</router-link>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Клиент</th>
                <th>Услуга</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="recentOrders.length === 0">
                <td colspan="4" class="text-muted text-sm" style="padding: 24px; text-align: center">Заказов пока нет</td>
              </tr>
              <tr v-for="o in recentOrders" :key="o.id">
                <td class="text-muted text-sm">{{ o.orderNumber }}</td>
                <td>{{ o.client?.firstName }} {{ o.client?.lastName }}</td>
                <td>{{ o.service?.name }}</td>
                <td><span class="badge" :class="statusClass(o.status)">{{ statusLabel(o.status) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Masters load -->
        <div class="card">
          <h3 class="table-title mb-4" style="font-size: 20px">Загруженность мастеров</h3>
          <div v-if="mastersLoad.length === 0" class="text-muted text-sm">Мастера не найдены</div>
          <div v-for="m in mastersLoad" :key="m.id" style="margin-bottom: 18px">
            <div class="flex-between" style="margin-bottom: 6px">
              <span class="text-sm">{{ m.name }}</span>
              <span class="text-sm text-muted">{{ m.orders }} заказ(а)</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="`width: ${m.load}%`"></div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-if="apiError" class="alert alert-error mt-4">{{ apiError }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'

const loading     = ref(true)
const apiError    = ref('')
const stats       = ref([])
const recentOrders = ref([])
const mastersLoad  = ref([])

onMounted(async () => {
  try {
    const [statsRes, ordersRes, loadRes] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/orders'),
      api.get('/admin/masters-load'),
    ])
    stats.value = [
      { label: 'Заказов всего',   value: statsRes.data.total },
      { label: 'В работе',        value: statsRes.data.inProgress },
      { label: 'Готово сегодня',  value: statsRes.data.readyToday },
      { label: 'Выручка за месяц', value: formatPrice(statsRes.data.revenue) },
    ]
    recentOrders.value = ordersRes.data.slice(0, 6)
    mastersLoad.value  = loadRes.data
  } catch (e) {
    apiError.value = 'Не удалось загрузить данные. Проверьте подключение к серверу.'
  } finally {
    loading.value = false
  }
})

function formatPrice(v) {
  return v ? `${Number(v).toLocaleString('ru-RU')} ₽` : '0 ₽'
}

const STATUS_MAP = {
  new:        { label: 'Новый',    cls: 'badge-new' },
  in_progress:{ label: 'В работе', cls: 'badge-progress' },
  fitting:    { label: 'Примерка', cls: 'badge-fitting' },
  ready:      { label: 'Готов',    cls: 'badge-ready' },
  delivered:  { label: 'Выдан',    cls: 'badge-delivered' },
  cancelled:  { label: 'Отменён',  cls: 'badge-cancelled' },
}
function statusLabel(s) { return STATUS_MAP[s]?.label || s }
function statusClass(s) { return STATUS_MAP[s]?.cls  || '' }
</script>

<style scoped>
.progress-bar  { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(to right, var(--gold), var(--gold-dark)); border-radius: 3px; transition: width 0.7s ease; }
</style>
