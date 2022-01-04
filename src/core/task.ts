import { commaListsAnd } from 'common-tags'
import { CustomStreamWriter, ExecuteFn, SetOutput } from '../support'

export type CreateTaskOptions<T> = Partial<
Pick<Task, 'dependencies' | 'preAuthSudo'>
> & { title: string, run?: ExecuteFn<T>, rollback?: ExecuteFn<void> }

export type TaskStatus = 'open' | 'busy' | 'done'

export class Task<T = any> {
  status: TaskStatus = 'open'
  dependencies: Task[] = []
  _title: string
  result: Promise<T | undefined>
  preAuthSudo = false

  get hasNoDependencies (): boolean {
    return this.dependencies.every((task) => task.status === 'done')
  }

  get title (): string {
    const waitingFor = this.dependencies
      .filter((d) => d.status !== 'done')
      ?.map((d) => d._title)
    return waitingFor.length > 0
      ? commaListsAnd`${this._title} [Waiting for ${waitingFor}]`
      : this._title
  }

  constructor (options: CreateTaskOptions<T>) {
    this._title = options.title
    this.dependencies = options.dependencies ?? this.dependencies
    this._run = options.run ?? this._run
    this._rollback = options.rollback ?? this._rollback
    this.result = new Promise<T | undefined>((resolve, reject) => {
      this.resolveResult = resolve
      this.rejectResult = reject
    })
  }

  async run (setOutput: SetOutput): Promise<T | undefined> {
    this.status = 'busy'
    let res: T | undefined
    try {
      res = await this._run(setOutput, () => new CustomStreamWriter(setOutput))
      this.resolveResult(res)
    } catch (e) {
      this.rejectResult(e)
    } finally {
      this.status = 'done'
    }
    return res
  }

  async rollback (setOutput: SetOutput): Promise<void> {
    this.status = 'busy'
    await this._rollback(setOutput, () => new CustomStreamWriter(setOutput))
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
