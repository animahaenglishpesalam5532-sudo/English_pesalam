'use client'

import { useCallback, useEffect, useState } from 'react'
import { getRecipientHistory } from '@/app/actions/whatsappRecipients'

/**
 * Numbers worth warning the admin about, keyed by E.164 digits.
 *
 * Fetched once per selected template and shared by both ways of adding a
 * recipient — the records picker and the typed-in list — so a number that has
 * already failed is flagged wherever it is entered.
 */
export function useRecipientHistory(templateName: string) {
  const [sentPhones, setSentPhones] = useState<Set<string>>(new Set())
  const [failedPhones, setFailedPhones] = useState<Set<string>>(new Set())

  const reload = useCallback(async () => {
    const history = await getRecipientHistory(templateName)
    setSentPhones(new Set(history.sent))
    setFailedPhones(new Set(history.failed))
  }, [templateName])

  useEffect(() => {
    let active = true
    getRecipientHistory(templateName).then((history) => {
      if (!active) return
      setSentPhones(new Set(history.sent))
      setFailedPhones(new Set(history.failed))
    })
    return () => {
      active = false
    }
  }, [templateName])

  return { sentPhones, failedPhones, reload }
}
