import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin  = computed(() => user.value?.role === 'admin')
  const isMaster = computed(() => user.value?.role === 'master')
  const isClient = computed(() => user.value?.role === 'client')

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password })
    token.value = res.data.token
    user.value  = res.data.user
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user',  JSON.stringify(res.data.user))
    return res.data.user
  }

  async function register(data) {
    const res = await api.post('/auth/register', data)
    token.value = res.data.token
    user.value  = res.data.user
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user',  JSON.stringify(res.data.user))
    return res.data.user
  }

  function logout() {
    token.value = null
    user.value  = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { user, token, isAuthenticated, isAdmin, isMaster, isClient, login, register, logout }
})
