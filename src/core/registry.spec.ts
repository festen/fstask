import { Registry } from './registry'
import { Task } from './task'

describe('Registry', () => {
  let registry: Registry

  beforeEach(() => {
    registry = new Registry()
  })

  test('it should create', () => {
    expect(registry).toBeDefined()
  })

  test('it should start empty', () => {
    expect(registry.getAll()).toEqual([])
  })

  test('it should display added task', () => {
    const mockTask = new Task({ name: 'MockTask' })

    registry.register(mockTask)

    expect(registry.getAll()).toStrictEqual([mockTask])
  })

  test('it should handle multiple added tasks', () => {
    const mockTasks = [
      new Task({ name: 'Mock Task 1' }),
      new Task({ name: 'Mock Task 2' }),
      new Task({ name: 'Mock Task 3' }),
    ]

    mockTasks.forEach(registry.register.bind(registry))

    expect(registry.getAll()).toStrictEqual(mockTasks)
  })

  test('it should clear all tasks', () => {
    const mockTasks = [
      new Task({ name: 'Mock Task 1' }),
      new Task({ name: 'Mock Task 2' }),
      new Task({ name: 'Mock Task 3' }),
    ]

    mockTasks.forEach(registry.register.bind(registry))
    registry.clear()

    expect(registry.getAll()).toStrictEqual([])
  })
})
