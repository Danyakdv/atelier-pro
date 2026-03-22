<template>
  <div class="auth-page">
    <div class="auth-left">
      <div class="auth-brand">
        <div class="brand-mark">✦</div>
        <h1 class="brand-name">AtelierPro</h1>
        <p class="brand-tagline">Создайте аккаунт и начните работать с нашим ателье</p>
      </div>
      <blockquote class="auth-quote">
        <p>«Одежда — это форма самовыражения»</p>
        <cite>— Ив Сен-Лоран</cite>
      </blockquote>
    </div>

    <div class="auth-right">
      <div class="auth-box">
        <div class="auth-header">
          <h2>Регистрация</h2>
          <p>Заполните данные для создания аккаунта клиента</p>
        </div>

        <form @submit.prevent="handleRegister">
          <div v-if="error" class="alert alert-error mb-4">⚠ {{ error }}</div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Имя *</label>
              <input v-model="form.firstName" type="text" class="form-input" placeholder="Анна" required />
            </div>
            <div class="form-group">
              <label class="form-label">Фамилия *</label>
              <input v-model="form.lastName" type="text" class="form-input" placeholder="Иванова" required />
            </div>
          </div>

          <div class="form-group mt-3">
            <label class="form-label">Email *</label>
            <input v-model="form.email" type="email" class="form-input" placeholder="anna@mail.com" required />
          </div>

          <div class="form-group mt-3">
            <label class="form-label">Телефон</label>
            <input v-model="form.phone" type="tel" class="form-input" placeholder="+7 (999) 000-00-00" />
          </div>

          <div class="form-group mt-3">
            <label class="form-label">Пароль *</label>
            <input v-model="form.password" type="password" class="form-input" placeholder="Минимум 6 символов" required minlength="6" />
          </div>

          <div class="form-group mt-3">
            <label class="form-label">Подтвердите пароль *</label>
            <input v-model="form.confirm" type="password" class="form-input" placeholder="Повторите пароль" required />
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4" :disabled="loading" style="justify-content: center;">
            {{ loading ? 'Создаём аккаунт...' : 'Создать аккаунт' }}
          </button>
        </form>

        <p class="auth-switch">
          Уже есть аккаунт? <router-link to="/login">Войти</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router  = useRouter()
const auth    = useAuthStore()
const error   = ref('')
const loading = ref(false)

const form = reactive({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' })

async function handleRegister() {
  error.value = ''
  if (form.password !== form.confirm) { error.value = 'Пароли не совпадают'; return }
  loading.value = true
  try {
    await auth.register({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, password: form.password })
    router.push('/client')
  } catch (e) {
    error.value = e.response?.data?.message || 'Ошибка при регистрации'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { display: flex; min-height: 100vh; }
.auth-left { width: 380px; flex-shrink: 0; background: var(--dark); display: flex; flex-direction: column; padding: 52px 44px; }
.auth-brand { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.brand-mark { font-size: 40px; color: var(--gold); margin-bottom: 18px; }
.brand-name { font-family: var(--font-display); font-size: 46px; font-weight: 600; color: var(--white); }
.brand-tagline { font-size: 15px; color: rgba(255,255,255,0.38); margin-top: 14px; line-height: 1.65; }
.auth-quote { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 22px; }
.auth-quote p { font-family: var(--font-display); font-style: italic; font-size: 16px; color: rgba(255,255,255,0.48); }
.auth-quote cite { font-size: 12px; color: rgba(255,255,255,0.22); margin-top: 6px; display: block; font-style: normal; }
.auth-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; background: var(--cream); }
.auth-box { width: 100%; max-width: 460px; animation: fadeIn 0.35s ease; }
.auth-header { margin-bottom: 24px; }
.auth-header h2 { font-size: 36px; font-weight: 300; color: var(--dark); }
.auth-header p  { color: var(--muted); font-size: 14px; margin-top: 4px; }
.auth-switch { text-align: center; margin-top: 20px; font-size: 14px; color: var(--muted); }
.auth-switch a { color: var(--gold-dark); font-weight: 500; margin-left: 4px; }
@media (max-width: 860px) { .auth-left { display: none; } }
</style>
