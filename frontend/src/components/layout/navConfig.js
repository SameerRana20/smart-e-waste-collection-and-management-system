import {
  BadgeCheck,
  Calendar,
  ClipboardList,
  Gift,
  LayoutDashboard,
  LogOut,
  Shield,
  Truck,
  User,
  Users,
} from 'lucide-react'

export function getNavItems(role) {
  const r = String(role || '').toLowerCase()
  if (r === 'admin') {
    return [
      { to: '/admin', label: 'Dashboard', icon: Shield },
      { to: '/admin/profile', label: 'Profile', icon: User },
      { to: '/admin/collectors/pending', label: 'Pending Collectors', icon: BadgeCheck },
      { to: '/admin/collectors', label: 'All Collectors', icon: Users },
      { to: '/admin/requests', label: 'All Requests', icon: ClipboardList },
    ]
  }
  if (r === 'collector') {
    return [
      { to: '/collector', label: 'Dashboard', icon: Truck },
      { to: '/collector/profile', label: 'Profile', icon: User },
      { to: '/collector/requests', label: 'All Requests', icon: Calendar },
    ]
  }
  return [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/requests/new', label: 'Create Request', icon: ClipboardList },
    { to: '/requests', label: 'My Requests', icon: ClipboardList },
    { to: '/rewards', label: 'Rewards', icon: Gift },
  ]
}

export const logoutItem = { to: '#logout', label: 'Logout', icon: LogOut }

