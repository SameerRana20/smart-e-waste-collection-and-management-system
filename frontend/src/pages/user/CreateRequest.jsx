import { Plus, Trash2, Upload } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { userService } from '../../services/userService.js'

function emptyItem() {
  return { itemType: '', quantity: 1, condition: 'working' }
}

function normalizeCreateResponse(res) {
  const d = res?.data ?? null
  return { requestId: d?.requestId ?? null, itemIds: d?.itemIds ?? [], raw: d }
}

export function CreateRequest() {
  const [items, setItems] = useState([emptyItem()])
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState(null)
  const [filesByItem, setFilesByItem] = useState(() => ({})) // itemId -> File[]
  const [previewsByItem, setPreviewsByItem] = useState(() => ({})) // itemId -> string[]
  const [uploading, setUploading] = useState(() => ({})) // itemId -> boolean

  const canSubmit = useMemo(() => {
    return (
      items.length > 0 &&
      items.every((it) => it.itemType.trim() && Number(it.quantity) > 0 && it.condition)
    )
  }, [items])

  function updateItem(idx, patch) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  function removeItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  async function onCreate(e) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const res = await userService.createRequest({ items })
      const norm = normalizeCreateResponse(res)
      setCreated(norm)
      toast.success(res?.message || 'Request created')
    } finally {
      setSubmitting(false)
    }
  }

  function onSelectFiles(itemId, list) {
    const files = Array.from(list || []).slice(0, 5)
    setFilesByItem((s) => ({ ...s, [itemId]: files }))
  }

  useEffect(() => {
    // Build object URLs for previews and clean up old ones
    setPreviewsByItem((prev) => {
      for (const urls of Object.values(prev)) {
        for (const u of urls || []) URL.revokeObjectURL(u)
      }
      return {}
    })

    const next = {}
    for (const [itemId, files] of Object.entries(filesByItem)) {
      next[itemId] = (files || []).map((f) => URL.createObjectURL(f))
    }
    setPreviewsByItem(next)

    return () => {
      for (const urls of Object.values(next)) {
        for (const u of urls || []) URL.revokeObjectURL(u)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(Object.entries(filesByItem).map(([k, v]) => [k, (v || []).map((f) => f.name + f.size)]))])

  async function onUpload(itemId) {
    const files = filesByItem[itemId] || []
    if (!files.length) return
    if (files.length > 5) {
      toast.error('Max 5 images per item')
      return
    }
    setUploading((s) => ({ ...s, [itemId]: true }))
    try {
      const res = await userService.uploadItemImages(itemId, files)
      toast.success(res?.message || 'Images uploaded')
      setFilesByItem((s) => ({ ...s, [itemId]: [] }))
    } finally {
      setUploading((s) => ({ ...s, [itemId]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold text-slate-900">Create Request</div>
        <div className="text-sm text-slate-600">
          Add one or more items. After submission you can upload images per item.
        </div>
      </div>

      <Card className="p-5">
        <form onSubmit={onCreate} className="space-y-4">
          <div className="space-y-3">
            {items.map((it, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-900">Item {idx + 1}</div>
                  {items.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Input
                    label="Item type"
                    value={it.itemType}
                    onChange={(e) => updateItem(idx, { itemType: e.target.value })}
                    placeholder="Laptop, Phone, Battery…"
                  />
                  <Input
                    label="Quantity"
                    type="number"
                    min="1"
                    value={it.quantity}
                    onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                  />
                  <Select
                    label="Condition"
                    value={it.condition}
                    onChange={(e) => updateItem(idx, { condition: e.target.value })}
                  >
                    <option value="working">Working</option>
                    <option value="damaged">Damaged</option>
                    <option value="unknown">Unknown</option>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setItems((prev) => [...prev, emptyItem()])}
            >
              <Plus className="h-4 w-4" />
              Add item
            </Button>

            <Button type="submit" disabled={!canSubmit || submitting}>
              {submitting ? 'Creating…' : 'Create request'}
            </Button>
          </div>
        </form>
      </Card>

      {created?.requestId ? (
        <Card className="p-5">
          <div className="text-sm font-semibold text-slate-900">Request created</div>
          <div className="mt-1 text-sm text-slate-600">
            Request ID: <span className="font-medium text-slate-900">{created.requestId}</span>
          </div>
          <div className="mt-4">
            <div className="text-sm font-medium text-slate-700">Upload images per item</div>
            <div className="mt-3 space-y-3">
              {(created.itemIds || []).map((itemId) => (
                <div
                  key={itemId}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="text-sm text-slate-700">
                    Item ID: <span className="font-medium text-slate-900">{itemId}</span>
                    <div className="mt-1 text-xs text-slate-500">Max 5 images</div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => onSelectFiles(itemId, e.target.files)}
                      className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 sm:w-auto"
                    />
                    <Button
                      type="button"
                      onClick={() => onUpload(itemId)}
                      disabled={uploading[itemId] || !(filesByItem[itemId]?.length)}
                    >
                      {uploading[itemId] ? <Spinner className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                      Upload
                    </Button>
                  </div>

                  {(previewsByItem[itemId] || []).length ? (
                    <div className="w-full sm:col-span-2">
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {previewsByItem[itemId].map((url) => (
                          <div
                            key={url}
                            className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                          >
                            <img
                              src={url}
                              alt="Preview"
                              className="h-16 w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
              {!created.itemIds?.length ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Backend did not return `itemIds`. This flow requires itemIds to upload images.
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  )
}

