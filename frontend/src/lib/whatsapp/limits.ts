/**
 * Meta throttles hard on bursts, so one send action is capped at this many
 * recipients. Enforced both in the picker UI and again server-side.
 */
export const MAX_RECIPIENTS = 250
