import { chalk } from 'zx'
import { Task } from '../task'
import { ExecuteFunction } from '../../support'
import { Runnable } from './runnable'

export async function debugModeRun (
  runnables: Runnable[],
  getExecutable: <T> (t: Task<T>) => ExecuteFunction<T, void>,
): Promise<void> {
  for (const runnable of runnables) {
    if (runnables.length > 1) {
      process.stdout.write(
        chalk.blue('\n' + chalk.bold(`==> ${runnable.name}`)) + '\n',
      )
    }
    for (const task of runnable.tasks) {
      process.stdout.write(chalk.bold(task.name) + '\n')
      await getExecutable(task)({
        caller: task,
        setOutput: (txt: string) => process.stdout.write(txt + '\n'),
        setTitle: (txt: string) => process.stdout.write(txt + '\n'),
        setStatus: (txt: string) => process.stdout.write(txt + '\n'),
        setWarning: (txt: string) => process.stderr.write(txt + '\n'),
        setError: (txt: string) => process.stderr.write(txt + '\n'),
      })
    }
  }
}
