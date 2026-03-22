<template>
  <div class="page-enter-active">
    <div class="page-header">
      <h1 class="page-title">Новый заказ</h1>
      <p class="page-subtitle">Оформите заказ на пошив или ремонт одежды</p>
    </div>

    <div v-if="loadingServices" class="spinner"></div>

    <form v-else @submit.prevent="submitOrder" class="order-form">
      <!-- Step 1: Service -->
      <div class="form-section card">
        <h3 class="section-title">1. Выберите услугу</h3>
        <div v-if="apiError" class="alert alert-error mb-4">{{ apiError }}</div>

        <div class="services-grid">
          <div
            v-for="s in services"
            :key="s.id"
            class="service-option"
            :class="{ selected: form.serviceId === s.id }"
            @click="form.serviceId = s.id"
          >
            <div class="service-option-name">{{ s.name }}</div>
            <div class="service-option-cat text-muted text-sm">{{ s.category }}</div>
            <div class="service-option-price">от {{ Number(s.basePrice).toLocaleString('ru-RU') }} ₽</div>
            <div class="service-option-duration text-muted text-sm">~{{ s.duration }} дней</div>
            <div v-if="s.description" class="service-option-desc text-muted text-sm">{{ s.description }}</div>
          </div>
        </div>
      </div>

      <!-- Step 2: Description -->
      <div class="form-section card mt-4">
        <h3 class="section-title">2. Описание заказа</h3>

        <div class="form-group">
          <label class="form-label">Описание *</label>
          <textarea
            v-model="form.description"
            class="form-input"
            rows="4"
            placeholder="Опишите, что вы хотите: фасон, цвет, материал, особые пожелания..."
            required
          ></textarea>
        </div>

        <div class="form-group mt-3">
          <label class="form-label">Пожелания и комментарии</label>
          <textarea
            v-model="form.clientComment"
            class="form-input"
            rows="2"
            placeholder="Дополнительные пожелания мастеру..."
          ></textarea>
        </div>

        <div class="form-group mt-3">
          <label class="form-label">Желаемый срок готовности</label>
          <input v-model="form.deadline" type="date" class="form-input" style="max-width: 220px" :min="minDate" />
        </div>
      </div>

      <!-- Step 3: Measurements -->
      <div class="form-section card mt-4">
        <h3 class="section-title">3. Мерки <span class="text-muted text-sm" style="font-family:var(--font-body)">(по желанию)</span></h3>
        <p class="text-muted text-sm mb-4">Укажите мерки, чтобы мастер мог заранее подготовиться. Также можно снять мерки при встрече.</p>

        <div class="grid-3" style="gap: 12px">
          <div class="form-group" v-for="m in MEASUREMENTS" :key="m.key">
            <label class="form-label">{{ m.label }} (см)</label>
            <input v-model="measurements[m.key]" type="number" class="form-input" :placeholder="m.placeholder" min="1" max="300" />
          </div>
        </div>
      </div>

      <div v-if="submitError" class="alert alert-error mt-4">{{ submitError }}</div>

      <div class="flex gap-3 mt-4" style="justify-content: flex-end">
        <router-link to="/client/orders" class="btn btn-outline">Отмена</router-link>
        <button type="submit" class="btn btn-primary" :disabled="!form.serviceId || !form.description || submitting">
          {{ submitting ? 'Отправляем...' : 'Оформить заказ' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'

const router = useRouter()

const services       = ref([])
const loadingServices = ref(true)
const apiError       = ref('')
const submitError    = ref('')
const submitting     = ref(false)

const form = reactive({ serviceId: null, description: '', clientComment: '', deadline: '' })
const measurements = reactive({})

const MEASUREMENTS = [
  { key: 'chest',   label: 'Обхват груди',  placeholder: '90' },
  { key: 'waist',   label: 'Обхват талии',  placeholder: '70' },
  { key: 'hips',    label: 'Обхват бёдер',  placeholder: '96' },
  { key: 'height',  label: 'Рост',          placeholder: '168' },
  { key: 'shoulder',label: 'Ширина плеч',   placeholder: '38' },
  { key: 'sleeve',  label: 'Длина рукава',  placeholder: '60' },
]

const minDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
})

onMounted(async () => {
  try {
    const res = await api.get('/services')
    services.value = res.data
  } catch {
    apiError.value = 'Не удалось загрузить список услуг. Попробуйте позже.'
  } finally {
    loadingServices.value = false
  }
})

async function submitOrder() {
  submitError.value = ''
  submitting.value  = true
  try {
    const hasMeasurements = Object.values(measurements).some(v => v)
    await api.post('/orders', {
      serviceId:     form.serviceId,
      description:   form.description,
      clientComment: form.clientComment || null,
      deadline:      form.deadline || null,
      measurements:  hasMeasurements ? { ...measurements } : null,
    })
    router.push('/client/orders')
  } catch (e) {
    submitError.value = e.response?.data?.message || 'Ошибка при создании заказа'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.order-form {}
.form-section {}
.section-title { font-family: var(--font-display); font-size: 22px; font-weight: 400; margin-bottom: 18px; }

/* Service options */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}
.service-option {
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition);
  background: var(--surface);
}
.service-option:hover { border-color: var(--gold-light); background: var(--ivory); }
.service-option.selected { border-color: var(--gold); background: rgba(201,169,110,0.06); box-shadow: 0 0 0 3px rgba(201,169,110,0.15); }
.service-option-name  { font-weight: 500; font-size: 15px; margin-bottom: 4px; }
.service-option-price { font-family: var(--font-display); font-size: 18px; margin-top: 8px; color: var(--gold-dark); }
.service-option-duration { margin-top: 2px; }
.service-option-desc { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); line-height: 1.4; }
</style>
