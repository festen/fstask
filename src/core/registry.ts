import { Task } from './task'
import { ExecuteFunction } from '../support'
import { chalk } from 'zx'

export interface RegisterTaskOptions<T> {
  name: string
  run?: ExecuteFunction<T, T | undefined>
  rollback?: ExecuteFunction<T, void>
  uses?: Array<Task | string>
  sudo?: string | boolean
}

export class Registry {
  #tasks: Task[] = []

  getAll (): Task[] {
    const unresolvedDependencies: Array<{ task: string, deps: string[] }> =
      Object.entries(this.forwardRefCache)
        .map(([task, { deps }]) => ({
          task,
          deps,
        }))
        .filter(({ deps }) => deps.length > 0)
    if (unresolvedDependencies.length > 0) {
      // noinspection TypeScriptValidateJSTypes
      const msg = unresolvedDependencies
        .map(({ task, deps }) => ({
          task: chalk.bold(task),
          deps: deps.map((d) => chalk.bold(d)).join(','),
        }))
        .map(
          ({ task, deps }) => `Task ${task} has unresolved dependencies ${deps}`,
        )
        .join('\n')
      console.error(msg)
      throw new Error('Unresolved dependencies')
    }
    return Task.sort(this.#tasks)
  }

  register = <T>(optionsOrTask: RegisterTaskOptions<T> | Task<T>): Task => {
    const [task, deps] = Registry.ensureTask(optionsOrTask)
    this.updateCache(task, deps)
    this.#tasks.push(task)
    return task
  }

  clear (): void {
    this.#tasks = []
    this.forwardRefCache = {}
  }

  resolve (task: string): Task | undefined {
    return this.#tasks.find((t) => t.name === task)
  }

  private forwardRefCache: Record<string, { task: Task, deps: string[] }> = {}

  private resolveDependencies (): void {
    for (const { task, deps } of Object.values(this.forwardRefCache)) {
      for (const dep of deps) {
        if (this.forwardRefCache[dep] !== undefined) {
          this.forwardRefCache[task.name].deps = this.forwardRefCache[
            task.name
          ].deps.filter((d) => d !== dep)
          task.uses.push(this.forwardRefCache[dep].task)
        }
      }
    }
  }

  private updateCache (task: Task, forwardDependencies: string[]): void {
    if (this.forwardRefCache[task.name] !== undefined) {
      throw new Error(`Task with name ${task.name} was already registered`)
    }
    this.forwardRefCache[task.name] = {
      task,
      deps: forwardDependencies,
    }
    this.resolveDependencies()
  }

  private static ensureTask<T>(
    options: RegisterTaskOptions<T> | Task<T>,
  ): [Task<T>, string[]] {
    if (options instanceof Task) return [options, []]
    const optionsDependencies = options.uses ?? []
    const filter = optionsDependencies.filter.bind(optionsDependencies)
    const stringDependencies = filter((d) => typeof d === 'string') as string[]
    const taskDependencies = filter((d) => typeof d !== 'string') as Array<Task<T>>
    const task = new Task<T>({
      ...options,
      uses: taskDependencies,
    })
    return [task, stringDependencies]
  }
}
