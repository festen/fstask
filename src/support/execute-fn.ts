import { Writable } from 'stream'
import { SetOutput } from './set-output'

export type ExecuteFn<T> = (
  setOutput: SetOutput,
  getPipeSink: () => Writable
) => Promise<T>
