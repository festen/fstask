import { Registry } from './registry'

export interface Step {
  name: string
  order: number
  registry: Registry
}
