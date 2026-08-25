'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { Modal } from '@/components/ui/Modal'
import DateField from '../../DateField'
import { INPUT, LABEL } from '../styles'
import { createCampaign } from '@/app/actions/whatsappCampaigns'

interface Props {
  open: boolean
  onClose: () => void
  onCreated: (campaignId: string) => void
}

export function CampaignFormModal({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startsOn, setStartsOn] = useState('')
  const [endsOn, setEndsOn] = useState('')
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setName('')
    setDescription('')
    setStartsOn('')
    setEndsOn('')
  }

  const submit = async () => {
    setSaving(true)
    const res = await createCampaign({ name, description, startsOn, endsOn })
    setSaving(false)
    if (res.error) return toast.error(res.error)
    toast.success('Campaign created')
    reset()
    onCreated(res.id!)
    onClose()
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="New campaign">
      <div className="space-y-4">
        <div>
          <label className={LABEL}>Campaign name</label>
          <input
            className={INPUT}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Book Launch — August"
            autoFocus
          />
        </div>
        <div>
          <label className={LABEL}>Description</label>
          <textarea
            className={`${INPUT} min-h-[80px]`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What this campaign is promoting, and to whom."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Start date</label>
            <DateField
              className={`${INPUT} cursor-pointer`}
              value={startsOn}
              onChange={setStartsOn}
            />
          </div>
          <div>
            <label className={LABEL}>End date</label>
            <DateField className={`${INPUT} cursor-pointer`} value={endsOn} onChange={setEndsOn} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving || !name.trim()}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Creating…' : 'Create campaign'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
