import { useCallback, useState } from 'react'

export function useAsync(asyncFn, { immediate = false } = {}) {
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const run = useCallback(
    async (...args) => {
      setLoading(true)
      setError(null)
      try {
        const res = await asyncFn(...args)
        setData(res)
        return res
      } catch (e) {
        setError(e)
        throw e
      } finally {
        setLoading(false)
      }
    },
    [asyncFn],
  )

  return { loading, error, data, run, setData }
}

