<template>
  <div class="page-enter-active">
    <div class="page-header flex-between">
      <div>
        <h1 class="page-title">Мастера</h1>
        <p class="page-subtitle">Сотрудники ателье</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">+ Добавить мастера</button>
    </div>

    <div v-if="loading" class="spinner"></div>

    <div v-else-if="masters.length === 0" class="empty-state">
      <div class="empty-state-icon">🧵</div>
      <div class="empty-state-text">Мастера не найдены</div>
      <div class="empty-state-sub">Добавьте первого мастера</div>
    </div>

    <div v-else class="masters-grid">
      <div v-for="m in masters" :key="m.id" class="master-card card">
        <div class="master-avatar">{{ initials(m) }}</div>
        <div class="master-name">{{ m.firstName }} {{ m.lastName }}</div>
        <div class="master-spec text-muted text-sm">{{ m.specialization || 'Универсальный мастер' }}</div>
        <div class="master-stats">
          <div class="master-stat">
            <span class="master-stat-val">{{ m.activeOrders }}</span>
            <span class="master-stat-label">активных</span>
          </div>
          <div class="master-stat">
            <span class="master-stat-val">{{ m.completedOrders }}</span>
            <span class="master-stat-label">выполнено</span>
          </div>
        </div>
        <div class="text-muted text-sm">{{ m.email }}</div>
        <div class="flex gap-2 mt-3" style="width: 100%">
          <button class="btn btn-outline btn-sm" style="flex: 1" @click="openEdit(m)">Редактировать</button>
          <button class="btn btn-danger btn-sm" @click="deleteMaster(m)">🗑</button>
        </div>
      </div>
    </div>

    <div v-if="apiError" class="alert alert-error mt-4">{{ apiError }}</div>

    <!-- Modal -->
    <div v-if="modal" class="modal-overlay" @click.self="modal = false">
      <div class="modal">
        <button class="modal-close" @click="modal = false">✕</button>
        <h3 class="modal-title">{{ isEdit ? 'Редактировать мастера' : 'Новый мастер' }}</h3>

        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Имя *</label>
            <input v-model="form.firstName" class="form-input" placeholder="Имя" />
          </div>
          <div class="form-group">
            <label class="form-label">Фамилия *</label>
            <input v-model="form.lastName" class="form-input" placeholder="Фамилия" />
          </div>
        </div>
        <div class="form-group mt-3">
          <label class="form-label">Email *</label>
          <input v-model="form.email" type="email" class="form-input" :disabled="isEdit" placeholder="master@atelier.com" />
        </div>
        <div class="form-group mt-3">
          <label class="form-label">Телефон</label>
          <input v-model="form.phone" class="form-input" placeholder="+7 (999) 000-00-00" />
        </div>
        <div class="form-group mt-3">
          <label class="form-label">Специализация</label>
          <input v-model="form.specialization" class="form-input" placeholder="Вечерние платья, ремонт..." />
        </div>
        <div v-if="!isEdit" class="form-group mt-3">
          <label class="form-label">Пароль *</label>
          <input v-model="form.password" type="password" class="form-input" placeholder="Минимум 6 символов" />
        </div>

        <div v-if="modalError" class="alert alert-error mt-3">{{ modalError }}</div>

        <div class="flex gap-3 mt-4 text-right">
          <button class="btn btn-outline" @click="modal = false">Отмена</button>
          <button class="btn btn-primary" @click="saveMaster" :disabled="saving">
            {{ saving ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'

const masters  = ref([])
const loading  = ref(true)
const apiError = ref('')
const modal      = ref(false)
const isEdit     = ref(false)
const saving     = ref(false)
const modalError = ref('')
const form       = ref({})

onMounted(async () => {
  await loadMasters()
})

async function loadMasters() {
  loading.value = true
  try {
    const res = await api.get('/admin/masters')
    masters.value = res.data
  } catch {
    apiError.value = 'Ошибка загрузки мастеров'
  } finally {
    loading.value = false
  }
}

function initials(m) { return (m.firstName?.[0] || '') + (m.lastName?.[0] || '') }

function openCreate() {
  form.value   = {}
  isEdit.value = false
  modalError.value = ''
  modal.value  = true
}

function openEdit(m) {
  form.value   = { ...m }
  isEdit.value = true
  modalError.value = ''
  modal.value  = true
}

async function saveMaster() {
  if (!form.value.firstName || !form.value.lastName || !form.value.email) {
    modalError.value = 'Заполните обязательные поля'
    return
  }
  saving.value     = true
  modalError.value = ''
  try {
    if (isEdit.value) {
      const res = await api.put(`/admin/masters/${form.value.id}`, form.value)
      const idx = masters.value.findIndex(m => m.id === form.value.id)
      if (idx !== -1) masters.value[idx] = { ...masters.value[idx], ...res.data }
    } else {
      const res = await api.post('/admin/masters', { ...form.value, role: 'master' })
      masters.value.push({ ...res.data, activeOrders: 0, completedOrders: 0 })
    }
    modal.value = false
  } catch (e) {
    modalError.value = e.response?.data?.message || 'Ошибка сохранения'
  } finally {
    saving.value = false
  }
}

async function deleteMaster(m) {
  if (!confirm(`Удалить мастера ${m.firstName} ${m.lastName}?`)) return
  try {
    await api.delete(`/admin/masters/${m.id}`)
    masters.value = masters.value.filter(x => x.id !== m.id)
  } catch (e) {
    apiError.value = e.response?.data?.message || 'Ошибка удаления'
  }
}
</script>

<style scoped>
.masters-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
.master-card  { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 28px 20px; }
.master-avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: white; font-size: 22px; font-weight: 600; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
.master-name  { font-family: var(--font-display); font-size: 20px; }
.master-spec  { margin-top: 4px; }
.master-stats { display: flex; gap: 24px; margin: 16px 0; padding: 12px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); width: 100%; justify-content: center; }
.master-stat  { display: flex; flex-direction: column; align-items: center; }
.master-stat-val   { font-family: var(--font-display); font-size: 24px; font-weight: 300; }
.master-stat-label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
</style>
