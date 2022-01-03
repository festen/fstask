import { steps as unsortedSteps } from './step'
import { runTasks } from '../core'

type RunOptions = {
  concurrency?: number
  debug?: boolean
  rollback?: boolean
  interactive?: boolean
}

export const runRegisteredTasks = (options: RunOptions = {}) => {
  const steps = Object.entries(unsortedSteps)
    .sort(([key]) => Number.parseInt(key))
    .map(([, { name, registry }]) => ({ name, tasks: registry.getAll() }))
  return runTasks(steps, options)
}
