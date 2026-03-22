<template>
  <div class="page-enter-active">
    <div class="page-header flex-between">
      <div>
        <h1 class="page-title">Услуги</h1>
        <p class="page-subtitle">Каталог услуг ателье</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">+ Добавить услугу</button>
    </div>

    <div v-if="loading" class="spinner"></div>

    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Категория</th>
            <th>Базовая цена</th>
            <th>Срок (дней)</th>
            <th>Описание</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="services.length === 0">
            <td colspan="6">
              <div class="empty-state">
                <div class="empty-state-icon">🏷</div>
                <div class="empty-state-text">Услуги не добавлены</div>
              </div>
            </td>
          </tr>
          <tr v-for="s in services" :key="s.id">
            <td style="font-weight: 500">{{ s.name }}</td>
            <td><span class="badge badge-new">{{ s.category }}</span></td>
            <td>{{ Number(s.basePrice).toLocaleString('ru-RU') }} ₽</td>
            <td>{{ s.duration }}</td>
            <td class="text-muted text-sm" style="max-width: 220px">{{ s.description || '—' }}</td>
            <td>
              <div class="flex gap-2">
                <button class="btn btn-outline btn-sm" @click="openEdit(s)">✏️</button>
                <button class="btn btn-danger btn-sm" @click="deleteService(s)">🗑</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="apiError" class="alert alert-error mt-4">{{ apiError }}</div>

    <!-- Modal -->
    <div v-if="modal" class="modal-overlay" @click.self="modal = false">
      <div class="modal">
        <button class="modal-close" @click="modal = false">✕</button>
        <h3 class="modal-title">{{ isEdit ? 'Редактировать услугу' : 'Новая услуга' }}</h3>

        <div class="form-group">
          <label class="form-label">Название *</label>
          <input v-model="form.name" class="form-input" placeholder="Пошив платья" />
        </div>
        <div class="form-group mt-3">
          <label class="form-label">Категория *</label>
          <select v-model="form.category" class="form-input">
            <option value="Пошив">Пошив</option>
            <option value="Ремонт">Ремонт</option>
            <option value="Подгонка">Подгонка</option>
            <option value="Другое">Другое</option>
          </select>
        </div>
        <div class="grid-2 mt-3">
          <div class="form-group">
            <label class="form-label">Базовая цена (₽) *</label>
            <input v-model="form.basePrice" type="number" class="form-input" placeholder="5000" />
          </div>
          <div class="form-group">
            <label class="form-label">Срок (дней)</label>
            <input v-model="form.duration" type="number" class="form-input" placeholder="7" />
          </div>
        </div>
        <div class="form-group mt-3">
          <label class="form-label">Описание</label>
          <textarea v-model="form.description" class="form-input" rows="3" placeholder="Краткое описание услуги..."></textarea>
        </div>

        <div v-if="modalError" class="alert alert-error mt-3">{{ modalError }}</div>

        <div class="flex gap-3 mt-4 text-right">
          <button class="btn btn-outline" @click="modal = false">Отмена</button>
          <button class="btn btn-primary" @click="saveService" :disabled="saving">
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

const services  = ref([])
const loading   = ref(true)
const apiError  = ref('')
const modal      = ref(false)
const isEdit     = ref(false)
const saving     = ref(false)
const modalError = ref('')
const form       = ref({})

onMounted(async () => {
  try {
    const res = await api.get('/services')
    services.value = res.data
  } catch {
    apiError.value = 'Ошибка загрузки услуг'
  } finally {
    loading.value = false
  }
})

function openCreate() { form.value = { category: 'Пошив' }; isEdit.value = false; modalError.value = ''; modal.value = true }
function openEdit(s)  { form.value = { ...s }; isEdit.value = true; modalError.value = ''; modal.value = true }

async function saveService() {
  if (!form.value.name || !form.value.basePrice) { modalError.value = 'Заполните обязательные поля'; return }
  saving.value = true; modalError.value = ''
  try {
    if (isEdit.value) {
      const res = await api.put(`/services/${form.value.id}`, form.value)
      const idx = services.value.findIndex(s => s.id === form.value.id)
      if (idx !== -1) services.value[idx] = res.data
    } else {
      const res = await api.post('/services', form.value)
      services.value.push(res.data)
    }
    modal.value = false
  } catch (e) {
    modalError.value = e.response?.data?.message || 'Ошибка сохранения'
  } finally {
    saving.value = false
  }
}

async function deleteService(s) {
  if (!confirm(`Деактивировать услугу "${s.name}"?`)) return
  try {
    await api.delete(`/services/${s.id}`)
    services.value = services.value.filter(x => x.id !== s.id)
  } catch (e) {
    apiError.value = e.response?.data?.message || 'Ошибка'
  }
}
</script>
