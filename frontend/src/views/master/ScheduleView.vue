<template>
  <div class="page-enter-active">
    <div class="page-header">
      <h1 class="page-title">Расписание</h1>
      <p class="page-subtitle">Заказы с дедлайнами по датам</p>
    </div>

    <div v-if="loading" class="spinner"></div>

    <template v-else>
      <div v-if="schedule.length === 0" class="empty-state">
        <div class="empty-state-icon">📅</div>
        <div class="empty-state-text">Нет активных заказов</div>
      </div>

      <div v-else class="schedule-list">
        <div v-for="group in grouped" :key="group.date" class="schedule-group">
          <div class="schedule-date" :class="{ 'date-today': isToday(group.date), 'date-overdue': isOverdue(group.date) }">
            <span class="date-label">{{ formatGroupDate(group.date) }}</span>
            <span v-if="isToday(group.date)" class="date-badge">Сегодня</span>
            <span v-if="isOverdue(group.date)" class="date-badge overdue">Просрочено</span>
          </div>
          <div class="schedule-cards">
            <div v-for="o in group.orders" :key="o.id" class="schedule-card card">
              <div class="flex-between">
                <div>
                  <div class="schedule-order-num text-muted text-sm">{{ o.orderNumber }}</div>
                  <div class="schedule-service" style="font-weight:500; margin-top:2px">{{ o.service?.name }}</div>
                  <div class="text-muted text-sm mt-1">{{ o.client?.firstName }} {{ o.client?.lastName }}</div>
                </div>
                <span class="badge" :class="statusClass(o.status)">{{ statusLabel(o.status) }}</span>
              </div>
              <div v-if="o.description" class="text-muted text-sm mt-2" style="border-top:1px solid var(--border);padding-top:8px">
                {{ o.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-if="apiError" class="alert alert-error mt-4">{{ apiError }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'

const schedule = ref([])
const loading  = ref(true)
const apiError = ref('')

onMounted(async () => {
  try {
    const res = await api.get('/master/schedule')
    schedule.value = res.data
  } catch {
    apiError.value = 'Ошибка загрузки расписания'
  } finally {
    loading.value = false
  }
})

const grouped = computed(() => {
  const map = {}
  for (const o of schedule.value) {
    const key = o.deadline.slice(0, 10)
    if (!map[key]) map[key] = []
    map[key].push(o)
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, orders]) => ({ date, orders }))
})

function isToday(dateStr) {
  return dateStr === new Date().toISOString().slice(0, 10)
}
function isOverdue(dateStr) {
  return dateStr < new Date().toISOString().slice(0, 10)
}
function formatGroupDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
}

const STATUS_MAP = {
  new:        { label: 'Новый',    cls: 'badge-new' },
  in_progress:{ label: 'В работе', cls: 'badge-progress' },
  fitting:    { label: 'Примерка', cls: 'badge-fitting' },
  ready:      { label: 'Готов',    cls: 'badge-ready' },
}
function statusLabel(s) { return STATUS_MAP[s]?.label || s }
function statusClass(s) { return STATUS_MAP[s]?.cls   || '' }
</script>

<style scoped>
.schedule-list  { display: flex; flex-direction: column; gap: 24px; }
.schedule-group {}
.schedule-date  { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.date-label     { font-family: var(--font-display); font-size: 20px; font-weight: 400; text-transform: capitalize; }
.date-badge     { font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 12px; background: var(--gold-light); color: var(--gold-dark); }
.date-badge.overdue { background: #FDEDEC; color: var(--red); }
.date-today .date-label { color: var(--gold-dark); }
.date-overdue .date-label { color: var(--red); }
.schedule-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.schedule-card  { padding: 16px 18px; }
</style>
