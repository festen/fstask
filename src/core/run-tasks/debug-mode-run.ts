import { chalk } from 'zx'
import { Task } from '../task'
import { SetOutput } from '../../support'
import { Runnable } from './runnable'

export async function debugModeRun (
  runnables: Runnable[],
  getExecutable: (task: Task) => (setOutput: SetOutput) => Promise<void>,
): Promise<void> {
  for (const runnable of runnables) {
    if (runnables.length > 1) {
      process.stdout.write(
        chalk.blue('\n' + chalk.bold(`==> ${runnable.name}`)) + '\n',
      )
    }
    for (const task of runnable.tasks) {
      process.stdout.write(chalk.bold(task.title) + '\n')
      await getExecutable(task)((txt) => process.stdout.write(txt))
    }
  }
}
