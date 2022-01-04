import { $, chalk, sleep } from 'zx'
import { Task } from './task'
import { SetOutput, sudoStart, sudoStop } from '../support'
import tasuku from 'tasuku'

interface Options {
  concurrency: number
  debug: boolean
  interactive: boolean
  rollback: boolean
  preAuthSudo: boolean
}

interface Step {
  name: string
  tasks: Task[]
}

const defaultOptions: Options = {
  concurrency: 4,
  debug: false,
  interactive: false,
  rollback: false,
  preAuthSudo: false,
}

export const runTasks = async (
  steps: Step[],
  options: Partial<Options>,
): Promise<void> => {
  const { debug, concurrency, interactive, rollback, preAuthSudo } = {
    ...defaultOptions,
    ...options,
  }

  $.shell = '/bin/zsh'
  $.verbose = debug

  const command = (task: Task): ((setOutput: SetOutput) => Promise<void>) =>
    rollback ? task.rollback.bind(task) : task.run.bind(task)

  if (interactive) {
    // ask questions
  }

  if (preAuthSudo || steps.flatMap((s) => s.tasks).some((t) => t.preAuthSudo)) {
    await sudoStart()
  }

  if (debug) {
    for (const step of steps) {
      if (steps.length > 1) {
        process.stdout.write(chalk.blue(chalk.bold(`==> ${step.name}`)))
      }
      for (const task of step.tasks) {
        process.stdout.write(chalk.bold(task.title))
        await command(task)((txt) => process.stdout.write(txt))
      }
    }
    return
  }

  for (const step of steps) {
    if (steps.length > 1) {
      process.stdout.write(chalk.blue(chalk.bold(`==> ${step.name}`)))
    }
    await tasuku.group(
      (createTasks: any) =>
        step.tasks.map((task) => {
          return createTasks(
            task.title,
            async ({ setTitle, setOutput }: any) => {
              while (!task.hasNoDependencies) {
                setTitle(task.title)
                await sleep(1000)
              }
              setTitle(task.title)
              await command(task)(setOutput)
              await sleep(300)
              setOutput('')
            },
          )
        }),
      { concurrency },
    )
  }

  await sudoStop() // ignores when no session started
}
