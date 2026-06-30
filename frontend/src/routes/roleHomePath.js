export function roleHomePath(role) {
  const r = String(role || '').toLowerCase()
  if (r === 'admin') return '/admin'
  if (r === 'collector') return '/collector'
  return '/dashboard'
}

