import { SetFunction } from './set-function'
import { Task } from '../core'

export type ExecuteFn<T> = ({
  setOutput,
  setTitle,
  setStatus,
  setWarning,
  setError,
  caller,
}: {
  setOutput: SetFunction
  setTitle: SetFunction
  setStatus: SetFunction
  setWarning: SetFunction
  setError: SetFunction
  caller: Task
}) => Promise<T>
