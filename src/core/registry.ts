import { Task } from './task'
import { ExecuteFn } from '../support'
import { chalk } from 'zx'

export type RegisterTaskOptions<T> = {
  title: string
  run?: ExecuteFn<T>
  rollback?: ExecuteFn<void>
  dependencies?: Array<Task | string>
}

export class Registry {
  #tasks: Task[] = []

  getAll(): Task[] {
    const unresolvedDependencies: Array<{ task: string; deps: string[] }> =
      Object.entries(this.forwardRefCache)
        .map(([task, { deps }]) => ({
          task,
          deps,
        }))
        .filter(({ deps }) => deps.length > 0)
    if (unresolvedDependencies.length > 0) {
      const msg = unresolvedDependencies
        .map(({ task, deps }) => ({
          task: chalk.bold(task),
          deps: deps.map((d) => chalk.bold(d)).join(','),
        }))
        .map(
          ({ task, deps }) => `Task ${task} has unresolved dependencies ${deps}`
        )
        .join('\n')
      console.error(msg)
      throw new Error('Unresolved dependencies')
    }
    return Task.sort(this.#tasks)
  }

  register = <T>(optionsOrTask: RegisterTaskOptions<T> | Task<T>): void => {
    const [task, deps] = Registry.ensureTask(optionsOrTask)
    this.updateCache(task, deps)
    this.#tasks.push(task)
  }

  clear(): void {
    this.#tasks = []
    this.forwardRefCache = {}
  }

  resolve(task: string): Task | undefined {
    return this.#tasks.find((t) => t.title === task)
  }

  private forwardRefCache: Record<string, { task: Task; deps: string[] }> = {}

  private resolveDependencies() {
    for (const { task, deps } of Object.values(this.forwardRefCache)) {
      for (const dep of deps) {
        if (this.forwardRefCache[dep]) {
          this.forwardRefCache[task.title].deps = this.forwardRefCache[
            task.title
          ].deps.filter((d) => d !== dep)
          task.dependencies.push(this.forwardRefCache[dep].task)
        }
      }
    }
  }

  private updateCache(task: Task, forwardDependencies: string[]) {
    if (this.forwardRefCache[task.title]) {
      throw new Error(`Task with title ${task.title} was already registered`)
    }
    this.forwardRefCache[task.title] = { task, deps: forwardDependencies }
    this.resolveDependencies()
  }

  private static ensureTask<T>(
    options: RegisterTaskOptions<T> | Task
  ): [Task, string[]] {
    if (options instanceof Task) return [options, []]
    const optionsDependencies = options.dependencies ?? []
    const filter = optionsDependencies.filter.bind(optionsDependencies)
    const stringDependencies = filter((d) => typeof d === 'string') as string[]
    const taskDependencies = filter((d) => typeof d !== 'string') as Task[]
    const task = new Task({ ...options, dependencies: taskDependencies })
    return [task, stringDependencies]
  }
}
