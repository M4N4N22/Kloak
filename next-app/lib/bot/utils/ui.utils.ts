import { FLOW_STEPS, TOTAL_STEPS } from "../flows/payment.flow.types"

export function formatStep(step: keyof typeof FLOW_STEPS, title: string) {
  const current = FLOW_STEPS[step]

  return `Step ${current}/${TOTAL_STEPS}\n\n${title}`
}