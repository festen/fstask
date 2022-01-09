import { sleep } from 'zx'
import tasuku from 'tasuku'
import { Task } from '../task'
import { ExecuteFunction } from '../../support'
import { Runnable } from './runnable'

export async function normalModeRun (
  runnables: Runnable[],
  getExecutable: <T> (task: Task<T>) => ExecuteFunction<T, void>,
  concurrency: number,
): Promise<void> {
  for (const runnable of runnables) {
    await tasuku.group(
      (createTasks: any) =>
        runnable.tasks.map((task) => {
          return createTasks(
            task.name,
            async ({
              setTitle,
              setOutput,
              setError,
              setStatus,
              setWarning,
            }: any) => {
              while (!task.hasNoDependencies) {
                setTitle(task.name)
                await sleep(1000)
              }
              setTitle(task.name)
              await getExecutable(task)({
                setOutput,
                setTitle,
                setError,
                setStatus,
                setWarning,
                caller: task,
              })
              await sleep(300)
              setOutput('')
            },
          )
        }),
      { concurrency },
    )
  }
}
