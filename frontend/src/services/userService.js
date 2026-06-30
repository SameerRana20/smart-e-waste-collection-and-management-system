import { api } from './apiClient.js'

export const userService = {
  async getDashboardStats() {
    const res = await api.get('/api/v1/requests/stats')
    return res.data
  },

  async getProfile() {
    const res = await api.get('/api/v1/user/me')
    return res.data
  },

  async updateProfile({ full_name, phone, address, city }) {
    const res = await api.patch('/api/v1/user/profile', { full_name, phone, address, city })
    return res.data
  },

  async createRequest({ items }) {
    // Collection uses trailing slash: /api/v1/requests/
    const res = await api.post('/api/v1/requests/', { items })
    return res.data
  },

  async uploadItemImages(itemId, files) {
    const form = new FormData()
    for (const f of files) form.append('images', f)
    const res = await api.post(`/api/v1/images/item/${itemId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  async listMyRequests() {
    const res = await api.get('/api/v1/requests/my')
    return res.data
  },

  async getRequest(id) {
    const res = await api.get(`/api/v1/requests/${id}`, { meta: { silent: true } })
    return res.data
  },

  async deleteRequest(id) {
    const res = await api.delete(`/api/v1/requests/${id}`)
    return res.data
  },

  async getMyPoints() {
    const res = await api.get('/api/v1/user/points')
    return res.data
  },

  async changePassword({ currentPassword, newPassword }) {
    const res = await api.patch('/api/v1/user/change-password', {
      password: currentPassword,
      newPassword,
    })
    return res.data
  },

  async updateAvatar(file) {
    const form = new FormData()
    form.append('avatar', file)
    const res = await api.patch('/api/v1/user/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },
}

