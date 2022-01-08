import { runTasks } from './run-tasks'
import { Registry } from '../registry'

describe('execute tasks', () => {
  let registry: Registry

  beforeEach(() => {
    registry = new Registry()
  })

  test('it should store result of executed tasks', async () => {
    registry.register({
      name: 'testTask',
      run: async (): Promise<string> => 'TEST_RESULT',
    })

    await runTasks([{ name: 'default', order: 0, registry }], {
      concurrency: 1,
      isDebug: true,
    })

    const testTask = registry.resolve('testTask')
    expect(await testTask?.result).toBe('TEST_RESULT')
  })
})
