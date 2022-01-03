import { Registry } from '../../core'
import { steps } from './steps'

export const getStep = (order = 0, stepName?: string): Registry => {
  const stepOrder = order.toString(10)

  if (!steps[stepOrder]) {
    steps[stepOrder] = {
      name: stepName ?? 'Main',
      registry: new Registry(),
    }
  }

  if (stepName) {
    steps[stepOrder].name = stepName
  }

  return steps[stepOrder].registry
}
