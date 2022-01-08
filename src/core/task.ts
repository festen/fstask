import { ExecuteFn } from '../support'

export type CreateTaskOptions<T> = Partial<
Pick<Task, 'dependencies' | 'preAuthSudo'>
> & { name: string, run?: ExecuteFn<T>, rollback?: ExecuteFn<void> }

export type TaskStatus = 'open' | 'busy' | 'done'

type RunArgs<T> = Parameters<ExecuteFn<T>>[0]

export class Task<T = any> {
  status: TaskStatus = 'open'
  dependencies: Task[] = []
  name: string
  result: Promise<T | undefined>
  preAuthSudo = false

  get hasNoDependencies (): boolean {
    return this.dependencies.every((task) => task.status === 'done')
  }

  constructor (options: CreateTaskOptions<T>) {
    this.name = options.name
    this.dependencies = options.dependencies ?? this.dependencies
    this._run = options.run ?? this._run
    this._rollback = options.rollback ?? this._rollback
    this.result = new Promise<T | undefined>((resolve, reject) => {
      this.resolveResult = resolve
      this.rejectResult = reject
    })
  }

  async run (args: RunArgs<T>): Promise<T | undefined> {
    this.status = 'busy'
    let res: T | undefined
    try {
      res = await this._run(args)
      this.resolveResult(res)
    } catch (e) {
      this.rejectResult(e)
    } finally {
      this.status = 'done'
    }
    return res
  }

  async rollback (args: RunArgs<T>): Promise<void> {
    this.status = 'busy'
    await this._rollback(args)
    this.status = 'done'
  }

  static sort (tasks: Task[], maxDepth = 10): Task[] {
    let open = tasks
    const sorted: Task[] = []
    while (open.length > 0 && maxDepth-- > 0) {
      // find all tasks that have no unmet dependencies
      const candidates = open.filter((t) =>
        t.dependencies.every((dep) => sorted.includes(dep)),
      )
      open = open.filter((t) => !candidates.includes(t))
      sorted.push(...candidates)
    }
    if (maxDepth < 0) throw Error('Max depth reached while sorting')
    return sorted
  }

  private resolveResult!: (value: T | undefined) => void
  private rejectResult!: (reason?: any) => void
  private readonly _run: ExecuteFn<T | undefined> = async () => undefined
  private readonly _rollback: ExecuteFn<void> = async () => {}
}
