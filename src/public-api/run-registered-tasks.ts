import { steps as unsortedSteps } from './step'
import { runTasks } from '../core'

interface RunOptions {
  concurrency?: number
  debug?: boolean
  rollback?: boolean
  interactive?: boolean
}

export const runRegisteredTasks = async (
  options: RunOptions = {},
): Promise<void> => {
  const steps = Object.entries(unsortedSteps)
    .sort(([key]) => Number.parseInt(key))
    .map(([, { name, registry }]) => ({ name, tasks: registry.getAll() }))
  return await runTasks(steps, options)
}
