import { Task } from '../core'

export type SetFunction = (text: string) => void

export interface ExecuteFunctionArguments<T> {
  setOutput: SetFunction
  setTitle: SetFunction
  setStatus: SetFunction
  setWarning: SetFunction
  setError: SetFunction
  caller: Task<T>
}

export type ExecuteFunction<TaskType, ReturnType> = (args: ExecuteFunctionArguments<TaskType>) => Promise<ReturnType>
