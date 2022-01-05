import { Task } from '../task'

export interface Runnable {
  name: string
  tasks: Task[]
}
