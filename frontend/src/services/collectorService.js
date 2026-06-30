import { api } from './apiClient.js'

export const collectorService = {
  async me() {
    const res = await api.get('/api/v1/collector/me')
    return res.data
  },

  async requests(status) {
    const res = await api.get('/api/v1/collector/requests', {
      params: status ? { status } : undefined,
    })
    return res.data
  },

  async assignedRequests() {
    return this.requests('assigned')
  },

  async requestDetails(id) {
    const res = await api.get(`/api/v1/collector/request/${id}`)
    return res.data
  },

  async approve(id, { scheduledDate }) {
    const res = await api.patch(`/api/v1/collector/request/${id}/approve`, { scheduledDate })
    return res.data
  },

  async reject(id) {
    const res = await api.patch(`/api/v1/collector/request/${id}/reject`)
    return res.data
  },

  async complete(id) {
    const res = await api.patch(`/api/v1/collector/request/${id}/pickup`)
    return res.data
  },

  async recordDisposition(id, { dispositionType, remarks }) {
    const res = await api.post(`/api/v1/collector/request/${id}/disposition`, {
      dispositionType,
      remarks,
    })
    return res.data
  },

  async changePassword({ currentPassword, newPassword }) {
    const res = await api.patch('/api/v1/collector/change-password', {
      password: currentPassword,
      newPassword,
    })
    return res.data
  },
}

