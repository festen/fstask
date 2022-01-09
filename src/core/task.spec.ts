import { Task } from './task'

describe('task', () => {
  describe('create', () => {
    test('it should create', () => {
      const task = new Task({ name: 'TEST' })
      expect(task).toBeInstanceOf(Task)
    })

    test('it should use name given', () => {
      const task = new Task({ name: 'TEST' })
      expect(task.name).toBe('TEST')
    })

    test('it should use function provided', async () => {
      const fn = async (): Promise<string> => 'TEST_EXECUTE'
      const task = new Task({
        name: 'Test',
        run: fn,
      })

      expect(
        await task.run({
          setOutput: () => {},
        } as any),
      ).toBe('TEST_EXECUTE')
    })
  })

  describe('Sort', () => {
    test('it should take into account dependencies in task order', () => {
      const t2 = new Task({ name: 'task 2' })
      const t1 = new Task({
        name: 'task 1',
        uses: [t2],
      })
      const t4 = new Task({ name: 'task 4' })
      const t5 = new Task({ name: 'task 5' })
      const t6 = new Task({
        name: 'task 6',
        uses: [t4, t5],
      })
      const t3 = new Task({
        name: 'task 3',
        uses: [t1, t6],
      })

      const sorted = Task.sort([t1, t2, t3, t4, t5, t6])

      const names = sorted.map((t) => t.name)
      expect(names).toEqual([
        'task 2',
        'task 4',
        'task 5',
        'task 1',
        'task 6',
        'task 3',
      ])
    })

    test('it throws when adding circular depended tasks', () => {
      const tasks = [new Task({ name: 'task 1' }), new Task({ name: 'task 2' })]
      tasks[0].uses = [tasks[1]]
      tasks[1].uses = [tasks[0]]

      const sortTasks = (): Task[] => Task.sort(tasks)

      expect(sortTasks).toThrow('Max depth reached while sorting')
    })
  })
})
