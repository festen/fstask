import { $ } from 'zx'
import { Task } from '../task'
import { ExecuteFunction, withContext } from '../../support'
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

const getAuthCommands = (steps: Step[]): Array<boolean | string> =>
  steps.flatMap((s) => s.registry.getAll()).map((t) => t.sudo)

const asRunnable = (steps: Step[]): Runnable[] =>
  steps.map((step) => ({
    name: step.name,
    tasks: step.registry.getAll(),
  }))

export const runTasks = async (
  steps: Step[],
  options: Partial<Options>,
): Promise<any> => {
  const { isDebug, isInteractive, useGlobalSudo, mode, concurrency } = {
    ...defaultOptions,
    ...Object.fromEntries(
      Object.entries(options).filter(([, v]) => v !== undefined),
    ),
  }

  $.shell = '/bin/zsh'
  $.verbose = isDebug

  let runnables = asRunnable(steps)
  const getExecutable = <T> (t: Task<T>): ExecuteFunction<T, any> => t[mode].bind(t)
  if (isInteractive) runnables = await showInteractivePrompt(runnables)
  const sudoCommands = [useGlobalSudo, ...getAuthCommands(steps.filter(s => runnables.find(r => r.name === s.name)))]

  await withContext(sudoCommands, async () => {
    if (isDebug) {
      await debugModeRun(runnables, getExecutable)
    } else {
      await normalModeRun(runnables, getExecutable, concurrency)
    }
  })
}
