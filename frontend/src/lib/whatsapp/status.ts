// Delivery status of a logged outbound message.
//
// 'sent' only means Meta accepted the send. Delivery is confirmed later by the
// status webhook, which promotes the row to 'delivered' and then 'read', or
// demotes it to 'failed' if Meta ended up dropping it.

export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed'

/** Statuses that mean the message reached Meta, i.e. it counts as a send. */
export const SENT_STATUSES: MessageStatus[] = ['sent', 'delivered', 'read']

/**
 * Webhooks can arrive out of order, so a status may only ever move forward.
 * 'failed' is terminal and outranks everything.
 */
const RANK: Record<MessageStatus, number> = {
  sent: 1,
  delivered: 2,
  read: 3,
  failed: 4,
}

export function isMessageStatus(value: string): value is MessageStatus {
  return value in RANK
}

export function outranks(next: MessageStatus, current: MessageStatus): boolean {
  return RANK[next] > RANK[current]
}
