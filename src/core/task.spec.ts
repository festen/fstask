import { Task } from './task'

describe('task', () => {
  describe('create', () => {
    test('it should create', () => {
      const task = new Task({ title: 'TEST' })
      expect(task).toBeInstanceOf(Task)
    })

    test('it should use title given', () => {
      const task = new Task({ title: 'TEST' })
      expect(task.title).toBe('TEST')
    })

    test('it should use function provided', async () => {
      const fn = () => Promise.resolve('TEST_EXECUTE')
      const task = new Task({ title: 'Test', run: fn })

      expect(await task.run(() => {})).toBe('TEST_EXECUTE')
    })
  })

  describe('Sort', () => {
    test('it should take into account dependencies in task order', () => {
      const t2 = new Task({ title: 'task 2' })
      const t1 = new Task({ title: 'task 1', dependencies: [t2] })
      const t4 = new Task({ title: 'task 4' })
      const t5 = new Task({ title: 'task 5' })
      const t6 = new Task({ title: 'task 6', dependencies: [t4, t5] })
      const t3 = new Task({ title: 'task 3', dependencies: [t1, t6] })

      const sorted = Task.sort([t1, t2, t3, t4, t5, t6])

      const titles = sorted.map((t) => t.title)
      expect(titles).toEqual([
        'task 2',
        'task 4',
        'task 5',
        'task 1 [Waiting for task 2]',
        'task 6 [Waiting for task 4 and task 5]',
        'task 3 [Waiting for task 1 and task 6]',
      ])
    })

    test('it throws when adding circular depended tasks', () => {
      const tasks = [
        new Task({ title: 'task 1' }),
        new Task({ title: 'task 2' }),
      ]
      tasks[0].dependencies = [tasks[1]]
      tasks[1].dependencies = [tasks[0]]

      const sortTasks = () => Task.sort(tasks)

      expect(sortTasks).toThrow('Max depth reached while sorting')
    })
  })
})
