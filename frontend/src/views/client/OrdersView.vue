<template>
  <div class="page-enter-active">
    <div class="page-header flex-between">
      <div>
        <h1 class="page-title">Мои заказы</h1>
        <p class="page-subtitle">История и текущие заказы</p>
      </div>
      <router-link to="/client/new-order" class="btn btn-primary">+ Новый заказ</router-link>
    </div>

    <div v-if="loading" class="spinner"></div>

    <template v-else>
      <div v-if="orders.length === 0" class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-text">У вас пока нет заказов</div>
        <div class="empty-state-sub">Оформите первый заказ в нашем ателье</div>
        <router-link to="/client/new-order" class="btn btn-primary mt-4">Создать заказ</router-link>
      </div>

      <div v-else class="orders-list">
        <div v-for="o in orders" :key="o.id" class="order-card card">
          <div class="order-head flex-between">
            <div>
              <span class="order-num text-muted text-sm">{{ o.orderNumber }}</span>
              <h3 class="order-service">{{ o.service?.name }}</h3>
            </div>
            <span class="badge" :class="statusClass(o.status)">{{ statusLabel(o.status) }}</span>
          </div>

          <!-- Status timeline -->
          <div class="order-timeline">
            <div
              v-for="step in TIMELINE"
              :key="step.status"
              class="timeline-step"
              :class="{
                'step-done':    isStepDone(o.status, step.status),
                'step-current': o.status === step.status,
                'step-cancelled': o.status === 'cancelled',
              }"
            >
              <div class="step-dot"></div>
              <div class="step-label">{{ step.label }}</div>
            </div>
          </div>

          <div class="order-details">
            <div class="detail-row">
              <span class="text-muted text-sm">Мастер</span>
              <span class="text-sm">{{ o.master ? `${o.master.firstName} ${o.master.lastName}` : 'Не назначен' }}</span>
            </div>
            <div v-if="o.deadline" class="detail-row">
              <span class="text-muted text-sm">Срок готовности</span>
              <span class="text-sm">{{ fmtDate(o.deadline) }}</span>
            </div>
            <div v-if="o.price" class="detail-row">
              <span class="text-muted text-sm">Стоимость</span>
              <span class="text-sm" style="font-weight:500">{{ Number(o.price).toLocaleString('ru-RU') }} ₽</span>
            </div>
            <div v-if="o.masterComment" class="detail-row">
              <span class="text-muted text-sm">Комментарий мастера</span>
              <span class="text-sm">{{ o.masterComment }}</span>
            </div>
          </div>

          <div v-if="o.description" class="order-desc text-muted text-sm">
            {{ o.description }}
          </div>

          <div class="order-date text-muted text-sm">
            Создан {{ fmtDate(o.createdAt) }}
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

const orders   = ref([])
const loading  = ref(true)
const apiError = ref('')

onMounted(async () => {
  try {
    const res = await api.get('/client/orders')
    orders.value = res.data
  } catch {
    apiError.value = 'Ошибка загрузки заказов'
  } finally {
    loading.value = false
  }
})

const TIMELINE = [
  { status: 'new',         label: 'Принят' },
  { status: 'in_progress', label: 'В работе' },
  { status: 'fitting',     label: 'Примерка' },
  { status: 'ready',       label: 'Готов' },
  { status: 'delivered',   label: 'Выдан' },
]

const ORDER = ['new','in_progress','fitting','ready','delivered']

function isStepDone(currentStatus, stepStatus) {
  if (currentStatus === 'cancelled') return false
  return ORDER.indexOf(currentStatus) > ORDER.indexOf(stepStatus)
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
.orders-list { display: flex; flex-direction: column; gap: 16px; }
.order-card  { padding: 20px 24px; }
.order-num   { display: block; margin-bottom: 2px; }
.order-service { font-family: var(--font-display); font-size: 22px; font-weight: 400; }

/* Timeline */
.order-timeline { display: flex; align-items: center; margin: 16px 0; }
.timeline-step  { display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; }
.timeline-step:not(:last-child)::after {
  content: ''; position: absolute; top: 7px; left: 50%; width: 100%; height: 2px;
  background: var(--border); z-index: 0;
}
.step-done::after, .step-current::after { background: var(--gold) !important; }
.step-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--border); border: 2px solid var(--border); z-index: 1; }
.step-done    .step-dot { background: var(--gold); border-color: var(--gold); }
.step-current .step-dot { background: var(--white); border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,169,110,0.2); }
.step-cancelled .step-dot { background: var(--red); border-color: var(--red); }
.step-label { font-size: 10px; color: var(--muted); margin-top: 5px; text-align: center; letter-spacing: 0.03em; }
.step-done .step-label, .step-current .step-label { color: var(--charcoal); }

/* Details */
.order-details { display: flex; flex-direction: column; gap: 6px; padding: 12px 0; border-top: 1px solid var(--border); margin-top: 4px; }
.detail-row { display: flex; justify-content: space-between; gap: 16px; }
.order-desc { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); }
.order-date { margin-top: 8px; text-align: right; }
</style>
