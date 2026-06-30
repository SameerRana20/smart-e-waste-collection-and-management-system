import { api } from './apiClient.js'

export const adminService = {
  async me() {
    const res = await api.get('/api/v1/admin/me', { meta: { silent: true } })
    return res.data
  },

  async dashboard() {
    const res = await api.get('/api/v1/admin/dashboard')
    return res.data
  },

  async pendingCollectors() {
    const res = await api.get('/api/v1/admin/collectors/pending')
    return res.data
  },

  async approveCollector(id) {
    const res = await api.patch(`/api/v1/admin/collector/${id}/approve`)
    return res.data
  },

  async rejectCollector(id) {
    const res = await api.patch(`/api/v1/admin/collector/${id}/reject`)
    return res.data
  },

  async allCollectors() {
    const res = await api.get('/api/v1/admin/collectors')
    return res.data
  },

  async allRequestsDetailed() {
    const res = await api.get('/api/v1/admin/requests-detailed')
    return res.data
  },

  async allRequests() {
    const res = await api.get('/api/v1/admin/requests')
    return res.data
  },

  async updateProfile({ full_name }) {
    const res = await api.patch('/api/v1/admin/profile', { full_name })
    return res.data
  },

  async changePassword({ currentPassword, newPassword }) {
    const res = await api.patch('/api/v1/admin/change-password', {
      password: currentPassword,
      newPassword,
    })
    return res.data
  },

  async updateAvatar(file) {
    const form = new FormData()
    form.append('avatar', file)
    const res = await api.patch('/api/v1/admin/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },
}

