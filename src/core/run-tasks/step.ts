import { Task } from '../task'

export interface Step {
  name: string
  tasks: Task[]
}
