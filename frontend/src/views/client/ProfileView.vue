<template>
  <div class="page-enter-active">
    <div class="page-header">
      <h1 class="page-title">Профиль</h1>
      <p class="page-subtitle">Ваши личные данные</p>
    </div>

    <div class="profile-layout">
      <!-- Avatar card -->
      <div class="card profile-avatar-card">
        <div class="profile-avatar">{{ initials }}</div>
        <div class="profile-name">{{ user?.firstName }} {{ user?.lastName }}</div>
        <div class="profile-role text-muted text-sm">Клиент</div>
        <div class="profile-email text-muted text-sm mt-2">{{ user?.email }}</div>
      </div>

      <!-- Edit form -->
      <div class="card" style="flex: 1">
        <h3 class="table-title mb-4" style="font-size: 20px">Редактировать данные</h3>

        <form @submit.prevent="saveProfile">
          <div v-if="success" class="alert alert-success mb-4">✓ Данные успешно сохранены</div>
          <div v-if="error"   class="alert alert-error mb-4">⚠ {{ error }}</div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Имя</label>
              <input v-model="form.firstName" class="form-input" placeholder="Имя" required />
            </div>
            <div class="form-group">
              <label class="form-label">Фамилия</label>
              <input v-model="form.lastName" class="form-input" placeholder="Фамилия" required />
            </div>
          </div>

          <div class="form-group mt-3">
            <label class="form-label">Email</label>
            <input :value="user?.email" class="form-input" disabled style="opacity: 0.6; cursor: not-allowed" />
            <span class="text-muted text-sm mt-1">Email нельзя изменить</span>
          </div>

          <div class="form-group mt-3">
            <label class="form-label">Телефон</label>
            <input v-model="form.phone" type="tel" class="form-input" placeholder="+7 (999) 000-00-00" />
          </div>

          <div class="flex gap-3 mt-4" style="justify-content: flex-end">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Сохранение...' : 'Сохранить изменения' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'

const auth    = useAuthStore()
const user    = computed(() => auth.user)
const saving  = ref(false)
const success = ref(false)
const error   = ref('')

const form = reactive({ firstName: '', lastName: '', phone: '' })

onMounted(() => {
  form.firstName = user.value?.firstName || ''
  form.lastName  = user.value?.lastName  || ''
  form.phone     = user.value?.phone     || ''
})

const initials = computed(() => {
  const u = user.value
  return u ? (u.firstName?.[0] || '') + (u.lastName?.[0] || '') : '?'
})

async function saveProfile() {
  saving.value  = true
  success.value = false
  error.value   = ''
  try {
    const res = await api.put('/client/profile', {
      firstName: form.firstName,
      lastName:  form.lastName,
      phone:     form.phone,
    })
    // Обновляем пользователя в store
    auth.user = res.data
    localStorage.setItem('user', JSON.stringify(res.data))
    success.value = true
    setTimeout(() => { success.value = false }, 3000)
  } catch (e) {
    error.value = e.response?.data?.message || 'Ошибка сохранения'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.profile-layout { display: flex; gap: 20px; align-items: flex-start; }
.profile-avatar-card { width: 220px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 28px 20px; }
.profile-avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), var(--gold-dark)); color: white; font-size: 26px; font-weight: 600; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
.profile-name   { font-family: var(--font-display); font-size: 20px; }
.profile-role   { margin-top: 4px; }
.profile-email  { word-break: break-all; }
@media (max-width: 700px) { .profile-layout { flex-direction: column; } .profile-avatar-card { width: 100%; } }
</style>
