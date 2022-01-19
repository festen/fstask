import { defaultRegistry } from './default-registry'
import { runTasks } from '../core'

interface RunOptions {
  concurrency?: number
  debug?: boolean
  mode?: 'run' | 'rollback'
  interactive?: boolean
}

export const runRegisteredTasks = async (
  options: RunOptions = {},
): Promise<any> =>
  await runTasks(defaultRegistry.getAllSteps(), {
    concurrency: options.concurrency,
    isDebug: options.debug,
    mode: options.mode,
    isInteractive: options.interactive,
  })
