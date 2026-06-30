import { api } from './apiClient.js'

export const authService = {
  async login({ role, email, password, username }) {
    const r = String(role || '').toLowerCase()

    if (r === 'admin') {
      const res = await api.post(
        '/api/v1/admin/login',
        { username, password },
        { meta: { silent: true } },
      )
      return res.data
    }

    if (r === 'collector') {
      const res = await api.post(
        '/api/v1/collector/login',
        { email, password },
        { meta: { silent: true } },
      )
      return res.data
    }

    const res = await api.post(
      '/api/v1/user/login',
      { email, password },
      { meta: { silent: true } },
    )
    return res.data
  },

  async registerUser(payload) {
    const res = await api.post('/api/v1/user/register', payload, { meta: { silent: true } })
    return res.data
  },

  async registerCollector(payload) {
    const res = await api.post('/api/v1/collector/register', payload, { meta: { silent: true } })
    return res.data
  },

  async me(role) {
    const r = String(role || '').toLowerCase()
    if (r === 'admin') {
      const res = await api.get('/api/v1/admin/me', { meta: { silent: true } })
      return res.data
    }
    if (r === 'collector') {
      const res = await api.get('/api/v1/collector/me', { meta: { silent: true } })
      return res.data
    }
    const res = await api.get('/api/v1/user/me', { meta: { silent: true } })
    return res.data
  },

  async logout(role) {
    const r = String(role || '').toLowerCase()
    if (r === 'admin') {
      const res = await api.post('/api/v1/admin/logout', null, { meta: { silent: true } })
      return res.data
    }
    if (r === 'collector') {
      const res = await api.post('/api/v1/collector/logout', null, { meta: { silent: true } })
      return res.data
    }
    const res = await api.post('/api/v1/user/logout', null, { meta: { silent: true } })
    return res.data
  },
}

