import { Step } from './step'
import { prompt } from 'inquirer'
import { Task } from '../task'
import { chalk } from 'zx'

const hydrate = (titles: string[], allTasks: Task[]): Task[] =>
  titles
    .map((title) => allTasks.find((task) => task.title === title))
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

export async function showInteractivePrompt (steps: Step[]): Promise<Step[]> {
  const allTasks = steps.flatMap((s) => s.tasks)

  const { selectedTitles } = await prompt<{ selectedTitles: string[] }>({
    type: 'checkbox',
    name: 'selectedTitles',
    message: 'Please select tasks to run',
    choices: steps.flatMap((s) =>
      allTasks.map((t) => ({ type: 'choice', name: t.title, checked: true })),
    ),
  })
  const selectedTasks: Task[] = hydrate(selectedTitles, allTasks)
  const relatedTasks = withRelated(selectedTasks)
  const titles = relatedTasks
    .map((t) => t.title)
    .map((title) =>
      selectedTitles.includes(title) ? chalk.bold(title) : chalk.grey(title),
    )

  process.stdout.write('The following tasks will be executed:\n')
  process.stdout.write(
    `(${chalk.bold('Selected task')}, ${chalk.grey('Dependent task')}):\n`,
  )
  process.stdout.write(` - ${titles.join('\n - ')}\n`)
  const { confirmation } = await prompt<{ confirmation: boolean }>({
    type: 'confirm',
    name: 'confirmation',
    message: 'Run selected tasks?',
  })
  if (!confirmation) await showInteractivePrompt(steps)
  return steps
    .map(({ name, tasks }) => ({
      name,
      tasks: tasks.filter((t) => relatedTasks.includes(t)),
    }))
    .filter((step) => step.tasks.length > 0)
}
