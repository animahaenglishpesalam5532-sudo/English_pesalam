'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { CampaignFormModal } from './CampaignFormModal'
import { LABEL } from '../styles'
import { getCampaignOptions, type CampaignOption } from '@/app/actions/whatsappCampaigns'

interface Props {
  campaigns: CampaignOption[]
  value: string
  onChange: (campaignId: string) => void
  onCampaignsChange: (campaigns: CampaignOption[]) => void
}

/** Nothing goes out without a campaign, so this sits above the send button. */
export function CampaignSelect({ campaigns, value, onChange, onCampaignsChange }: Props) {
  const [creating, setCreating] = useState(false)

  const handleCreated = async (campaignId: string) => {
    onCampaignsChange(await getCampaignOptions())
    onChange(campaignId)
  }

  return (
    <div>
      <div className="mb-1 flex items-end justify-between gap-3">
        <label className={`${LABEL} mb-0`}>Campaign</label>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
        >
          <Plus className="h-3.5 w-3.5" /> New campaign
        </button>
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select a campaign…</option>
        {campaigns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {!value && (
        <p className="mt-1 text-xs text-gray-400">
          Every send is filed under a campaign — pick one to enable sending.
        </p>
      )}

      <CampaignFormModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
