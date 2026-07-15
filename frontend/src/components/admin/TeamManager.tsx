'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { UserPlus, ShieldCheck, User, Power, Trash2, KeyRound } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import {
  createStaff,
  setMemberActive,
  deleteStaff,
  resetMemberPassword,
  type Member,
} from '@/app/actions/team'

export default function TeamManager({ initialMembers }: { initialMembers: Member[] }) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [showCreate, setShowCreate] = useState(false)
  const [resetFor, setResetFor] = useState<Member | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  // create form
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [creating, setCreating] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [resetting, setResetting] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) return toast.error('Name is required')
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast.error('Enter a valid email')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setCreating(true)
    const res = await createStaff({ email, password, fullName })
    setCreating(false)
    if (res.error) return toast.error(res.error)
    toast.success('Staff member created')
    // optimistic add
    setMembers((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        email: email.trim().toLowerCase(),
        full_name: fullName.trim(),
        role: 'staff',
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ])
    setFullName('')
    setEmail('')
    setPassword('')
    setShowCreate(false)
  }

  const handleToggle = async (m: Member) => {
    setBusyId(m.id)
    const res = await setMemberActive(m.id, !m.is_active)
    setBusyId(null)
    if (res.error) return toast.error(res.error)
    setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_active: !m.is_active } : x)))
    toast.success(m.is_active ? 'Member deactivated' : 'Member activated')
  }

  const handleDelete = async (m: Member) => {
    if (!confirm(`Remove ${m.full_name || m.email}? This cannot be undone.`)) return
    setBusyId(m.id)
    const res = await deleteStaff(m.id)
    setBusyId(null)
    if (res.error) return toast.error(res.error)
    setMembers((prev) => prev.filter((x) => x.id !== m.id))
    toast.success('Member removed')
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetFor) return
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setResetting(true)
    const res = await resetMemberPassword(resetFor.id, newPassword)
    setResetting(false)
    if (res.error) return toast.error(res.error)
    toast.success('Password updated')
    setResetFor(null)
    setNewPassword('')
  }

  const inputCls =
    'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm text-gray-900'

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="mt-1 text-sm text-gray-500">Manage salesperson (staff) logins.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    No team members yet.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {m.full_name || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{m.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          m.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {m.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {m.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          m.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {m.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {m.role === 'staff' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setResetFor(m)}
                            title="Reset password"
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggle(m)}
                            disabled={busyId === m.id}
                            title={m.is_active ? 'Deactivate' : 'Activate'}
                            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(m)}
                            disabled={busyId === m.id}
                            title="Remove"
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Staff Member">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Priya" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input className={inputCls} type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
            <p className="mt-1 text-xs text-gray-400">Share these credentials with the salesperson.</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={creating} className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reset password modal */}
      <Modal isOpen={!!resetFor} onClose={() => setResetFor(null)} title={`Reset password${resetFor ? ` — ${resetFor.full_name || resetFor.email}` : ''}`}>
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <input className={inputCls} type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setResetFor(null)} className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={resetting} className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {resetting ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
