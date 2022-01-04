import { glob, path } from 'zx'

export const importAllTasks = async (): Promise<void> => {
  const taskFiles = await glob(path.join(__dirname, '../tasks/*.task.ts'))
  await Promise.allSettled(
    taskFiles.map(async (taskFile): Promise<any> => await import(taskFile)),
  )
}
