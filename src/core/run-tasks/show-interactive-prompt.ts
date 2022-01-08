import { prompt } from 'inquirer'
import { chalk } from 'zx'
import { Task } from '../task'
import { Runnable } from './runnable'

const hydrate = (names: string[], allTasks: Task[]): Task[] =>
  names
    .map((name) => allTasks.find((task) => task.name === name))
    .filter(((t) => t instanceof Task) as (t: any) => t is Task)

const withRelated = (selectedTasks: Task[]): Task[] => {
  let stable = false
  let maxDepth = 10
  const relatedTask: Task[] = selectedTasks
  while (!stable) {
    if (maxDepth-- < 0) throw new Error('Max depth reached')
    const newDependencies = relatedTask
      .flatMap((t) => t.dependencies)
      .filter((d) => !relatedTask.includes(d))
    if (newDependencies.length === 0) stable = true
    relatedTask.push(...newDependencies)
  }
  return relatedTask
}
// selectedTasks.reduce<Task[]>(
//   (acc, selected) => [
//     ...acc,
//     selected,
//     ...selected.dependencies.filter(
//       (dependentTask) => !acc.includes(dependentTask),
//     ),
//   ],
//   [],
// )

export async function showInteractivePrompt (
  runnables: Runnable[],
): Promise<Runnable[]> {
  const allTasks = runnables.flatMap((s) => s.tasks)

  const { selectedNames } = await prompt<{ selectedNames: string[] }>({
    type: 'checkbox',
    name: 'selectedNames',
    message: 'Please select tasks to run',
    choices: allTasks.map((t) => ({
      type: 'choice',
      name: t.name,
      checked: true,
    })),
  })
  const selectedTasks: Task[] = hydrate(selectedNames, allTasks)
  const relatedTasks = withRelated(selectedTasks)
  const names = relatedTasks
    .map((t) => t.name)
    .map((name) =>
      selectedNames.includes(name) ? chalk.bold(name) : chalk.grey(name),
    )

  process.stdout.write('The following tasks will be executed:\n')
  process.stdout.write(
    `(${chalk.bold('Selected task')}, ${chalk.grey('Dependent task')}):\n`,
  )
  process.stdout.write(` - ${names.join('\n - ')}\n`)
  const { confirmation } = await prompt<{ confirmation: boolean }>({
    type: 'confirm',
    name: 'confirmation',
    message: 'Run selected tasks?',
  })
  if (!confirmation) await showInteractivePrompt(runnables)
  return runnables
    .map(({ name, tasks }) => ({
      name,
      tasks: tasks.filter((t) => relatedTasks.includes(t)),
    }))
    .filter((step) => step.tasks.length > 0)
}
