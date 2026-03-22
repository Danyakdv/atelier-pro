<template>
  <div class="auth-page">
    <!-- Left panel -->
    <div class="auth-left">
      <div class="auth-brand">
        <div class="brand-mark">✦</div>
        <h1 class="brand-name">AtelierPro</h1>
        <p class="brand-tagline">Информационная система<br>ателье высокой моды</p>
      </div>
      <blockquote class="auth-quote">
        <p>«Мода проходит — стиль остаётся»</p>
        <cite>— Коко Шанель</cite>
      </blockquote>
    </div>

    <!-- Right panel -->
    <div class="auth-right">
      <div class="auth-box">
        <div class="auth-header">
          <h2>Добро пожаловать</h2>
          <p>Войдите в систему для продолжения</p>
        </div>

        <!-- Quick login buttons -->
        <div class="quick-login">
          <p class="quick-label">Быстрый вход (тестовые аккаунты)</p>
          <div class="quick-list">
            <button
              v-for="t in TEST_USERS"
              :key="t.role"
              class="quick-btn"
              :class="`quick-btn--${t.role}`"
              @click="fillCredentials(t)"
            >
              <span class="quick-icon">{{ t.icon }}</span>
              <div class="quick-info">
                <span class="quick-role">{{ t.label }}</span>
                <span class="quick-email">{{ t.email }}</span>
              </div>
              <span class="quick-arrow">→</span>
            </button>
          </div>
        </div>

        <div class="divider"><span>или введите вручную</span></div>

        <form @submit.prevent="handleLogin">
          <div v-if="error" class="alert alert-error mb-4">⚠ {{ error }}</div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="form.email" type="email" class="form-input" placeholder="example@mail.com" required />
          </div>

          <div class="form-group mt-3">
            <label class="form-label">Пароль</label>
            <div style="position: relative">
              <input
                v-model="form.password"
                :type="showPwd ? 'text' : 'password'"
                class="form-input"
                placeholder="••••••••"
                required
                style="padding-right: 42px"
              />
              <button type="button" class="eye-btn" @click="showPwd = !showPwd">
                {{ showPwd ? '🙈' : '👁' }}
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4" :disabled="loading" style="justify-content: center;">
            {{ loading ? 'Входим...' : 'Войти в систему' }}
          </button>
        </form>

        <p class="auth-switch">
          Нет аккаунта?
          <router-link to="/register">Зарегистрироваться</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()

const form    = reactive({ email: '', password: '' })
const error   = ref('')
const loading = ref(false)
const showPwd = ref(false)

const TEST_USERS = [
  { role: 'client', label: 'Клиент',         email: 'client@test.com', password: 'test123', icon: '👤' },
  { role: 'master', label: 'Мастер',          email: 'master@test.com', password: 'test123', icon: '🧵' },
  { role: 'admin',  label: 'Администратор',   email: 'admin@test.com',  password: 'test123', icon: '🔧' },
]

function fillCredentials(user) {
  form.email    = user.email
  form.password = user.password
  error.value   = ''
}

async function handleLogin() {
  error.value   = ''
  loading.value = true
  try {
    const user = await auth.login(form.email, form.password)
    const map  = { admin: '/admin', master: '/master', client: '/client' }
    router.push(map[user.role] || '/login')
  } catch (e) {
    error.value = e.response?.data?.message || 'Неверный email или пароль'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page   { display: flex; min-height: 100vh; }

/* Left */
.auth-left {
  width: 420px; flex-shrink: 0; background: var(--dark);
  display: flex; flex-direction: column; padding: 52px 44px;
  position: relative; overflow: hidden;
}
.auth-left::after {
  content: ''; position: absolute; bottom: -80px; right: -80px;
  width: 280px; height: 280px; border-radius: 50%;
  background: radial-gradient(circle, rgba(201,169,110,0.1) 0%, transparent 70%);
  pointer-events: none;
}
.auth-brand  { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.brand-mark  { font-size: 40px; color: var(--gold); margin-bottom: 18px; }
.brand-name  { font-family: var(--font-display); font-size: 52px; font-weight: 600; color: var(--white); letter-spacing: -0.01em; }
.brand-tagline { font-size: 15px; color: rgba(255,255,255,0.38); margin-top: 14px; line-height: 1.65; }
.auth-quote  { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 22px; }
.auth-quote p { font-family: var(--font-display); font-style: italic; font-size: 16px; color: rgba(255,255,255,0.48); }
.auth-quote cite { font-size: 12px; color: rgba(255,255,255,0.22); margin-top: 6px; display: block; font-style: normal; }

/* Right */
.auth-right  { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; background: var(--cream); }
.auth-box    { width: 100%; max-width: 440px; animation: fadeIn 0.35s ease; }
.auth-header { margin-bottom: 28px; }
.auth-header h2 { font-size: 36px; font-weight: 300; color: var(--dark); }
.auth-header p  { color: var(--muted); font-size: 14px; margin-top: 4px; }

/* Quick login */
.quick-login { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px; margin-bottom: 20px; }
.quick-label { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.09em; color: var(--muted); margin-bottom: 10px; }
.quick-list  { display: flex; flex-direction: column; gap: 8px; }
.quick-btn {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border-radius: var(--radius);
  background: var(--surface); border: 1px solid var(--border);
  transition: all var(--transition); text-align: left; width: 100%;
}
.quick-btn:hover { border-color: var(--gold); background: rgba(201,169,110,0.06); transform: translateX(4px); }
.quick-icon { font-size: 20px; }
.quick-info { display: flex; flex-direction: column; flex: 1; }
.quick-role  { font-size: 13px; font-weight: 500; color: var(--charcoal); }
.quick-email { font-size: 12px; color: var(--muted); }
.quick-arrow { font-size: 14px; color: var(--border); transition: color var(--transition); }
.quick-btn:hover .quick-arrow { color: var(--gold); }
.quick-btn--admin  .quick-role { color: var(--gold-dark); }
.quick-btn--master .quick-role { color: var(--blue); }
.quick-btn--client .quick-role { color: var(--green); }

/* Divider */
.divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.divider span { font-size: 12px; color: var(--muted); white-space: nowrap; }

.eye-btn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; font-size: 16px; opacity: 0.5; padding: 2px; }
.eye-btn:hover { opacity: 1; }

.auth-switch { text-align: center; margin-top: 20px; font-size: 14px; color: var(--muted); }
.auth-switch a { color: var(--gold-dark); font-weight: 500; margin-left: 4px; }
.auth-switch a:hover { text-decoration: underline; }

@media (max-width: 860px) { .auth-left { display: none; } }
</style>
