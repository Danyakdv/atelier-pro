<template>
  <div class="page-enter-active">
    <div class="page-header flex-between">
      <div>
        <h1 class="page-title">Заказы</h1>
        <p class="page-subtitle">Все заказы ателье</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="flex gap-3" style="flex-wrap: wrap; align-items: flex-end">
        <div class="form-group" style="flex: 1; min-width: 180px">
          <label class="form-label">Поиск</label>
          <input v-model="search" class="form-input" placeholder="Клиент, услуга или номер..." />
        </div>
        <div class="form-group" style="min-width: 160px">
          <label class="form-label">Статус</label>
          <select v-model="filterStatus" class="form-input">
            <option value="">Все статусы</option>
            <option v-for="[val, lbl] in STATUS_OPTIONS" :key="val" :value="val">{{ lbl }}</option>
          </select>
        </div>
        <div class="form-group" style="min-width: 160px">
          <label class="form-label">Мастер</label>
          <select v-model="filterMaster" class="form-input">
            <option value="">Все мастера</option>
            <option v-for="m in masters" :key="m._id" :value="String(m._id)">{{ m.firstName }} {{ m.lastName }}</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="spinner"></div>

    <div v-else class="table-wrap">
      <div class="table-header">
        <h3 class="table-title">
          Заказы
          <span class="text-muted" style="font-size: 16px; font-family: var(--font-body)">({{ filtered.length }})</span>
        </h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Клиент</th>
            <th>Услуга</th>
            <th>Мастер</th>
            <th>Дедлайн</th>
            <th>Цена</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="8">
              <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">Заказы не найдены</div>
              </div>
            </td>
          </tr>
          <tr v-for="o in filtered" :key="o.id">
            <td class="text-muted text-sm">{{ o.orderNumber }}</td>
            <td>
              <div style="font-weight: 500">{{ o.client?.firstName }} {{ o.client?.lastName }}</div>
              <div class="text-muted text-sm">{{ o.client?.phone }}</div>
            </td>
            <td>{{ o.service?.name }}</td>
            <td>{{ o.master ? `${o.master.firstName} ${o.master.lastName}` : '—' }}</td>
            <td class="text-sm">{{ fmtDate(o.deadline) }}</td>
            <td>{{ o.price ? `${Number(o.price).toLocaleString('ru-RU')} ₽` : '—' }}</td>
            <td><span class="badge" :class="statusClass(o.status)">{{ statusLabel(o.status) }}</span></td>
            <td>
              <button class="btn btn-outline btn-sm" @click="openEdit(o)">✏️ Изменить</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="apiError" class="alert alert-error mt-4">{{ apiError }}</div>

    <!-- Edit modal -->
    <div v-if="modal" class="modal-overlay" @click.self="modal = false">
      <div class="modal">
        <button class="modal-close" @click="modal = false">✕</button>
        <h3 class="modal-title">Заказ {{ editing.orderNumber }}</h3>

        <div class="form-group">
          <label class="form-label">Статус</label>
          <select v-model="editing.status" class="form-input">
            <option v-for="[val, lbl] in STATUS_OPTIONS" :key="val" :value="val">{{ lbl }}</option>
          </select>
        </div>

        <div class="form-group mt-3">
          <label class="form-label">Назначить мастера</label>
          <select v-model="editing.masterId" class="form-input">
            <option :value="null">Не назначен</option>
            <option v-for="m in masters" :key="m._id" :value="String(m._id)">{{ m.firstName }} {{ m.lastName }}</option>
          </select>
        </div>

        <div class="form-group mt-3">
          <label class="form-label">Дата сдачи</label>
          <input v-model="editing.deadlineStr" type="date" class="form-input" />
        </div>

        <div class="form-group mt-3">
          <label class="form-label">Цена (₽)</label>
          <input v-model="editing.price" type="number" class="form-input" placeholder="0" />
        </div>

        <div class="form-group mt-3">
          <label class="form-label">Комментарий мастера</label>
          <textarea v-model="editing.masterComment" class="form-input" rows="3" placeholder="Примечания..."></textarea>
        </div>

        <div v-if="saveError" class="alert alert-error mt-3">{{ saveError }}</div>

        <div class="flex gap-3 mt-4 text-right">
          <button class="btn btn-outline" @click="modal = false">Отмена</button>
          <button class="btn btn-primary" @click="saveOrder" :disabled="saving">
            {{ saving ? 'Сохранение...' : 'Сохранить' }}
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
const masters = ref([])
const loading = ref(true)
const apiError = ref('')
const search       = ref('')
const filterStatus = ref('')
const filterMaster = ref('')
const modal     = ref(false)
const editing   = ref({})
const saving    = ref(false)
const saveError = ref('')

const STATUS_OPTIONS = [
  ['new',         'Новый'],
  ['in_progress', 'В работе'],
  ['fitting',     'Примерка'],
  ['ready',       'Готов'],
  ['delivered',   'Выдан'],
  ['cancelled',   'Отменён'],
]

const STATUS_MAP = Object.fromEntries(
  STATUS_OPTIONS.map(([v,l], i) => [v, { label: l, cls: ['badge-new','badge-progress','badge-fitting','badge-ready','badge-delivered','badge-cancelled'][i] }])
)

const filtered = computed(() => {
  return orders.value.filter(o => {
    const q = search.value.toLowerCase()
    const clientName = `${o.client?.firstName} ${o.client?.lastName}`.toLowerCase()
    const matchSearch = !q || clientName.includes(q) || o.service?.name?.toLowerCase().includes(q) || o.orderNumber?.toLowerCase().includes(q)
    const matchStatus = !filterStatus.value || o.status === filterStatus.value
    const matchMaster = !filterMaster.value || o.masterId === filterMaster.value
    return matchSearch && matchStatus && matchMaster
  })
})

onMounted(async () => {
  try {
    const [ordersRes, mastersRes] = await Promise.all([
      api.get('/orders'),
      api.get('/admin/masters'),
    ])
    orders.value  = ordersRes.data
    masters.value = mastersRes.data
  } catch (e) {
    apiError.value = 'Ошибка загрузки данных'
  } finally {
    loading.value = false
  }
})

function openEdit(o) {
  editing.value = {
    ...o,
    masterId:    o.master?._id ? String(o.master._id) : null,
    deadlineStr: o.deadline ? o.deadline.slice(0, 10) : '',
  }
  saveError.value = ''
  modal.value = true
}

async function saveOrder() {
  saving.value    = true
  saveError.value = ''
  try {
    const payload = {
      status:        editing.value.status,
      masterId:      editing.value.masterId || null,
      price:         editing.value.price,
      deadline:      editing.value.deadlineStr || null,
      masterComment: editing.value.masterComment,
    }
    const res = await api.put(`/orders/${editing.value._id}`, payload)
    const idx = orders.value.findIndex(o => o._id === editing.value._id)
    if (idx !== -1) orders.value[idx] = res.data
    modal.value = false
  } catch (e) {
    saveError.value = e.response?.data?.message || 'Ошибка сохранения'
  } finally {
    saving.value = false
  }
}

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('ru-RU') : '—' }
function statusLabel(s) { return STATUS_MAP[s]?.label || s }
function statusClass(s) { return STATUS_MAP[s]?.cls   || '' }
</script>
