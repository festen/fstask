import { RegisterTaskOptions as CoreRegisterTaskOptions } from '../core'
import { defaultRegistry } from './default-registry'

type RegisterTaskOptions<T> = CoreRegisterTaskOptions<T> & {
  step?: number
}

export const registerTask = <T>(opts: RegisterTaskOptions<T>): void => {
  defaultRegistry.getStepByOrder(opts.step ?? 0).registry.register(opts)
}
