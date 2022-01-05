import { sleep } from 'zx'
import tasuku from 'tasuku'
import { Task } from '../task'
import { SetOutput } from '../../support'
import { Runnable } from './runnable'

export async function normalModeRun (
  runnables: Runnable[],
  getExecutable: (task: Task) => (setOutput: SetOutput) => Promise<void>,
  concurrency: number,
): Promise<void> {
  for (const runnable of runnables) {
    await tasuku.group(
      (createTasks: any) =>
        runnable.tasks.map((task) => {
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
