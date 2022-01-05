import { chalk, sleep } from 'zx'
import tasuku from 'tasuku'
import { Step } from './step'
import { Task } from '../task'
import { SetOutput } from '../../support'

export async function normalModeRun (
  steps: Step[],
  getExecutable: (task: Task) => (setOutput: SetOutput) => Promise<void>,
  concurrency: number,
): Promise<void> {
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
              await getExecutable(task)(setOutput)
              await sleep(300)
              setOutput('')
            },
          )
        }),
      { concurrency },
    )
  }
}
