import { RegisterTaskOptions as CoreRegisterTaskOptions } from '../core'
import { getStep } from './step'

type RegisterTaskOptions<T> = CoreRegisterTaskOptions<T> & {
  order?: number
  stepName?: string
}

export const registerTask = <T>(opts: RegisterTaskOptions<T>) =>
  getStep(opts.order, opts.stepName).register(opts)
