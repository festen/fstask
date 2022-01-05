import { chalk } from 'zx'
import { Step } from './step'
import { Task } from '../task'
import { SetOutput } from '../../support'

export async function debugModeRun (
  steps: Step[],
  getExecutable: (task: Task) => (setOutput: SetOutput) => Promise<void>,
): Promise<void> {
  for (const step of steps) {
    if (steps.length > 1) {
      process.stdout.write(chalk.blue(chalk.bold(`==> ${step.name}`)))
    }
    for (const task of step.tasks) {
      process.stdout.write(chalk.bold(task.title))
      await getExecutable(task)((txt) => process.stdout.write(txt))
    }
  }
}
