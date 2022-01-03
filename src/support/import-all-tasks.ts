export const importAllTasks = async () => {
  const taskFiles = await glob(path.join(__dirname, '../tasks/*.task.ts'))
  taskFiles.forEach((taskFile) => import(taskFile))
}
