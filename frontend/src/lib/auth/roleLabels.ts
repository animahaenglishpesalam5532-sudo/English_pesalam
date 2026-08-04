import type { Role } from './roles'
import type { AssignableRole } from '@/app/actions/team'

/** 'staff' is the salesperson role — kept as-is so existing rows need no migration. */
export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  staff: 'Salesperson',
  delivery: 'Delivery Person',
}

export const ROLE_BADGE: Record<Role, string> = {
  admin: 'bg-purple-100 text-purple-800',
  staff: 'bg-blue-100 text-blue-800',
  delivery: 'bg-amber-100 text-amber-800',
}

/** Roles an admin can pick from when creating a login. */
export const ASSIGNABLE_ROLES: { value: AssignableRole; label: string; hint: string }[] = [
  { value: 'staff', label: ROLE_LABEL.staff, hint: 'Sales Entry and their own records' },
  { value: 'delivery', label: ROLE_LABEL.delivery, hint: 'Book Tracking only' },
]
