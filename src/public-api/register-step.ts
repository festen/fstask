import { defaultRegistry } from './default-registry'

export const registerStep = (order: number, name: string): void =>
  defaultRegistry.registerStep(name, order)
