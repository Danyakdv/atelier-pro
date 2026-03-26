<template>
  <div class="page-enter-active">
    <div class="page-header">
      <h1 class="page-title">Мои заказы</h1>
      <p class="page-subtitle">Заказы, назначенные вам</p>
    </div>

    <div class="card mb-4">
      <div class="flex gap-3" style="flex-wrap: wrap; align-items: flex-end">
        <div class="form-group" style="flex: 1; min-width: 180px">
          <label class="form-label">Поиск</label>
          <input v-model="search" class="form-input" placeholder="Клиент или услуга..." />
        </div>
        <div class="form-group" style="min-width: 160px">
          <label class="form-label">Статус</label>
          <select v-model="filterStatus" class="form-input">
            <option value="">Все</option>
            <option value="new">Новый</option>
            <option value="in_progress">В работе</option>
            <option value="fitting">Примерка</option>
            <option value="ready">Готов</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="spinner"></div>

    <div v-else class="table-wrap">
      <div class="table-header">
        <h3 class="table-title">Заказы <span class="text-muted" style="font-size:16px;font-family:var(--font-body)">({{ filtered.length }})</span></h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Клиент</th>
            <th>Услуга</th>
            <th>Дедлайн</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="6">
              <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">Заказов нет</div>
                <div class="empty-state-sub">Администратор назначит вам заказы</div>
              </div>
            </td>
          </tr>
          <tr v-for="o in filtered" :key="o.id">
            <td class="text-muted text-sm">{{ o.orderNumber }}</td>
            <td>
              <div style="font-weight:500">{{ o.client?.firstName }} {{ o.client?.lastName }}</div>
              <div class="text-muted text-sm">{{ o.client?.phone }}</div>
            </td>
            <td>{{ o.service?.name }}</td>
            <td :class="isOverdue(o) ? 'text-danger' : 'text-sm'">{{ fmtDate(o.deadline) }}</td>
            <td><span class="badge" :class="statusClass(o.status)">{{ statusLabel(o.status) }}</span></td>
            <td>
              <button class="btn btn-outline btn-sm" @click="openUpdate(o)">Обновить статус</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="apiError" class="alert alert-error mt-4">{{ apiError }}</div>

    <!-- Update status modal -->
    <div v-if="modal" class="modal-overlay" @click.self="modal = false">
      <div class="modal">
        <button class="modal-close" @click="modal = false">✕</button>
        <h3 class="modal-title">{{ selected.orderNumber }}</h3>

        <div class="order-info card mb-4" style="background: var(--surface)">
          <div class="text-sm"><b>Клиент:</b> {{ selected.client?.firstName }} {{ selected.client?.lastName }}</div>
          <div class="text-sm mt-2"><b>Услуга:</b> {{ selected.service?.name }}</div>
          <div v-if="selected.description" class="text-sm mt-2 text-muted">{{ selected.description }}</div>
          <div v-if="selected.clientComment" class="text-sm mt-2"><b>Пожелание клиента:</b> {{ selected.clientComment }}</div>
          
          <!-- ИСПРАВЛЕННЫЙ БЛОК МЕРОК -->
          <div v-if="parsedMeasurements" class="text-sm mt-2">
            <b>Мерки:</b>
            <div class="measurements-grid">
              <div v-if="parsedMeasurements.chest" class="measurement-item">Обхват груди: {{ parsedMeasurements.chest }} см</div>
              <div v-if="parsedMeasurements.waist" class="measurement-item">Обхват талии: {{ parsedMeasurements.waist }} см</div>
              <div v-if="parsedMeasurements.hips" class="measurement-item">Обхват бёдер: {{ parsedMeasurements.hips }} см</div>
              <div v-if="parsedMeasurements.height" class="measurement-item">Рост: {{ parsedMeasurements.height }} см</div>
              <div v-if="parsedMeasurements.shoulder" class="measurement-item">Ширина плеч: {{ parsedMeasurements.shoulder }} см</div>
              <div v-if="parsedMeasurements.sleeve" class="measurement-item">Длина рукава: {{ parsedMeasurements.sleeve }} см</div>
            </div>
          </div>

        </div>

        <div class="form-group">
          <label class="form-label">Новый статус</label>
          <select v-model="newStatus" class="form-input">
            <option value="in_progress">В работе</option>
            <option value="fitting">Примерка</option>
            <option value="ready">Готов</option>
          </select>
        </div>

        <div class="form-group mt-3">
          <label class="form-label">Комментарий</label>
          <textarea v-model="masterComment" class="form-input" rows="3" placeholder="Примечания по заказу..."></textarea>
        </div>

        <div v-if="updateError" class="alert alert-error mt-3">{{ updateError }}</div>

        <div class="flex gap-3 mt-4 text-right">
          <button class="btn btn-outline" @click="modal = false">Отмена</button>
          <button class="btn btn-primary" @click="updateStatus" :disabled="saving">
            {{ saving ? 'Сохранение...' : 'Обновить статус' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'

const orders  = ref([])
const loading = ref(true)
const apiError = ref('')
const search       = ref('')
const filterStatus = ref('')
const modal        = ref(false)
const selected     = ref({})
const newStatus    = ref('in_progress')
const masterComment = ref('')
const saving       = ref(false)
const updateError  = ref('')

const filtered = computed(() => {
  return orders.value.filter(o => {
    const q = search.value.toLowerCase()
    const name = `${o.client?.firstName} ${o.client?.lastName}`.toLowerCase()
    const matchSearch = !q || name.includes(q) || o.service?.name?.toLowerCase().includes(q)
    const matchStatus = !filterStatus.value || o.status === filterStatus.value
    return matchSearch && matchStatus
  })
})

// ДОБАВЛЕНО: Вычисляемое свойство для парсинга строки мерок в объект
const parsedMeasurements = computed(() => {
  const m = selected.value?.measurements;
  if (!m) return null; // Если мерок нет, возвращаем null

  // Если это уже объект (на всякий случай), просто возвращаем его
  if (typeof m === 'object') return m;

  // Если это строка (JSON), пробуем распарсить
  try {
    return JSON.parse(m);
  } catch (error) {
    console.error("Ошибка при чтении мерок:", error);
    return null;
  }
});

onMounted(async () => {
  try {
    const res = await api.get('/master/orders')
    orders.value = res.data
  } catch {
    apiError.value = 'Ошибка загрузки заказов'
  } finally {
    loading.value = false
  }
})

function openUpdate(o) {
  selected.value = o
  newStatus.value = o.status === 'new' ? 'in_progress' : o.status
  masterComment.value = o.masterComment || ''
  updateError.value = ''
  modal.value = true
}

async function updateStatus() {
  saving.value = true
  updateError.value = ''
  try {
    const res = await api.put(`/master/orders/${selected.value.id}/status`, {
      status: newStatus.value,
      masterComment: masterComment.value,
    })
    const idx = orders.value.findIndex(o => o.id === selected.value.id)
    if (idx !== -1) orders.value[idx] = res.data
    modal.value = false
  } catch (e) {
    updateError.value = e.response?.data?.message || 'Ошибка обновления'
  } finally {
    saving.value = false
  }
}

const MEASUREMENT_LABELS = {
  chest:    'Обхват груди',
  waist:    'Обхват талии',
  hips:     'Обхват бёдер',
  height:   'Рост',
  shoulder: 'Ширина плеч',
  sleeve:   'Длина рукава',
}

function measurementLabel(key) {
  return MEASUREMENT_LABELS[key] || key
}

function hasMeasurements(m) {
  return m && Object.values(m).some(v => v)
}

// ИСПРАВЛЕНО: Восстановлено начало функции isOverdue, которое вы случайно удалили
function isOverdue(o) {
  return o.deadline && new Date(o.deadline) < new Date() && !['ready','delivered','cancelled'].includes(o.status)
}

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('ru-RU') : '—' }

const STATUS_MAP = {
  new:        { label: 'Новый',    cls: 'badge-new' },
  in_progress:{ label: 'В работе', cls: 'badge-progress' },
  fitting:    { label: 'Примерка', cls: 'badge-fitting' },
  ready:      { label: 'Готов',    cls: 'badge-ready' },
  delivered:  { label: 'Выдан',    cls: 'badge-delivered' },
  cancelled:  { label: 'Отменён',  cls: 'badge-cancelled' },
}
function statusLabel(s) { return STATUS_MAP[s]?.label || s }
function statusClass(s) { return STATUS_MAP[s]?.cls   || '' }
</script>

<style scoped>
.text-danger { color: var(--red); font-size: 13px; font-weight: 500; }
.measurements-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 16px;
  margin-top: 6px;
  padding: 8px 10px;
  background: var(--ivory);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}
.measurement-item { font-size: 13px; color: var(--text-color); }
</style>