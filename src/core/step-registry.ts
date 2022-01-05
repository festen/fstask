import { Registry } from './registry'
import { Step } from './step'

export class StepRegistry {
  #steps?: Record<string, { name: string, registry: Registry }>
  #default: Step = { order: 0, name: 'Default', registry: new Registry() }

  registerStep (name: string, order: number): void {
    const orderKey = order.toString(10)
    this.#steps ??= {}
    this.#steps[orderKey] ??= { name, registry: new Registry() }
    this.#steps[orderKey].name = name
  }

  getStepByOrder (order: number): Step {
    if (this.#steps === undefined) {
      if (order !== this.#default.order) {
        throw new Error(`Could not find step with order ${order}`)
      }
      return this.#default
    }
    const step = this.#steps[order.toString(10)]
    if (step === undefined) {
      throw new Error(`Could not find step with order ${order}`)
    }
    return { ...step, order }
  }

  getStepByName (name: string): Step {
    if (this.#steps === undefined) {
      if (name !== this.#default.name) {
        throw new Error(`Could not find step by name ${name}`)
      }
      return this.#default
    }
    const steps = Object.entries(this.#steps).filter(([, s]) => s.name === name)
    if (steps.length !== 1) {
      throw new Error(`Could not find step by name ${name}`)
    }
    return { order: Number(steps[0][0]), ...steps[0][1] }
  }

  getAllSteps (): Step[] {
    if (this.#steps === undefined) return [this.#default]
    return Object.entries(this.#steps)
      .sort(([key]) => Number(key))
      .map(([orderKey, rest]) => ({ order: Number(orderKey), ...rest }))
  }
}
