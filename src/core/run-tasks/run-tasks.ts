import { $ } from 'zx'
import { Task } from '../task'
import { ExecuteFn, withContext } from '../../support'
import { showInteractivePrompt } from './show-interactive-prompt'
import { debugModeRun } from './debug-mode-run'
import { normalModeRun } from './normal-mode-run'
import { Step } from '../step'
import { Runnable } from './runnable'

interface Options {
  concurrency: number
  isDebug: boolean
  isInteractive: boolean
  mode: 'run' | 'rollback'
  useGlobalSudo: boolean
}

const defaultOptions: Options = {
  concurrency: 4,
  isDebug: false,
  isInteractive: false,
  mode: 'run',
  useGlobalSudo: false,
}

const shouldAuth = (steps: Step[]): boolean =>
  steps.flatMap((s) => s.registry.getAll()).some((t) => t.preAuthSudo)

const asRunnable = (steps: Step[]): Runnable[] =>
  steps.map((step) => ({
    name: step.name,
    tasks: step.registry.getAll(),
  }))

export const runTasks = async (
  steps: Step[],
  options: Partial<Options>,
): Promise<void> => {
  const { isDebug, isInteractive, useGlobalSudo, mode, concurrency } = {
    ...defaultOptions,
    ...Object.fromEntries(
      Object.entries(options).filter(([, v]) => v !== undefined),
    ),
  }

  $.shell = '/bin/zsh'
  $.verbose = isDebug

  let runnables = asRunnable(steps)
  const useSudo = useGlobalSudo || shouldAuth(steps)
  const getExecutable = (t: Task): ExecuteFn<any> => t[mode].bind(t)
  if (isInteractive) runnables = await showInteractivePrompt(runnables)

  await withContext(useSudo, async () => {
    if (isDebug) {
      await debugModeRun(runnables, getExecutable)
    } else {
      await normalModeRun(runnables, getExecutable, concurrency)
    }
  })
}
