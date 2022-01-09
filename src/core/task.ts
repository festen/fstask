import { ExecuteFunction, ExecuteFunctionArguments } from '../support'

export interface CreateTaskOptions<T> {
  uses?: Task[]
  name: string
  run?: ExecuteFunction<T, T | undefined>
  rollback?: ExecuteFunction<T, void>
  sudo?: string | boolean
}

export type TaskStatus = 'open' | 'busy' | 'done'

export class Task<T = any> {
  status: TaskStatus = 'open'
  uses: Task[] = []
  name: string
  result: Promise<T | undefined>
  sudo: string | boolean = false

  get hasNoDependencies (): boolean {
    return this.uses.every((task) => task.status === 'done')
  }

  constructor (options: CreateTaskOptions<T>) {
    this.name = options.name
    this.uses = options.uses ?? this.uses
    this._run = options.run ?? this._run
    this._rollback = options.rollback ?? this._rollback
    this.sudo = options.sudo ?? this.sudo
    this.result = new Promise<T | undefined>((resolve, reject) => {
      this.resolveResult = resolve
      this.rejectResult = reject
    })
  }

  async run (args: ExecuteFunctionArguments<T>): Promise<T | undefined> {
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

  async rollback (args: ExecuteFunctionArguments<T>): Promise<void> {
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
        t.uses.every((dep) => sorted.includes(dep)),
      )
      open = open.filter((t) => !candidates.includes(t))
      sorted.push(...candidates)
    }
    if (maxDepth < 0) throw Error('Max depth reached while sorting')
    return sorted
  }

  private resolveResult!: (value: T | undefined) => void
  private rejectResult!: (reason?: any) => void
  private readonly _run: ExecuteFunction<T, T | undefined> = async () => undefined
  private readonly _rollback: ExecuteFunction<T, void> = async () => {}
}
