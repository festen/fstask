import { $ } from 'zx'
import { Task } from '../task'
import { SetOutput, withContext } from '../../support'
import { Step } from './step'
import { showInteractivePrompt } from './show-interactive-prompt'
import { debugModeRun } from './debug-mode-run'
import { normalModeRun } from './normal-mode-run'

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

type SetOutputFn = (setOutput: SetOutput) => Promise<void>

const shouldAuth = (steps: Step[]): boolean =>
  steps.flatMap((s) => s.tasks).some((t) => t.preAuthSudo)

export const runTasks = async (
  steps: Step[],
  options: Partial<Options>,
): Promise<void> => {
  const { isDebug, isInteractive, useGlobalSudo, mode, concurrency } = {
    ...defaultOptions,
    ...options,
  }

  $.shell = '/bin/zsh'
  $.verbose = isDebug

  const useSudo = useGlobalSudo || shouldAuth(steps)
  const getExecutable = (t: Task): SetOutputFn => t[mode].bind(t)
  if (isInteractive) steps = await showInteractivePrompt(steps)

  await withContext(useSudo, async () => {
    if (isDebug) await debugModeRun(steps, getExecutable)
    else await normalModeRun(steps, getExecutable, concurrency)
  })
}
